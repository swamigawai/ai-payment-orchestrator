from dotenv import load_dotenv
load_dotenv()

import asyncio
from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.agents.graph import app_graph
from app.core.db import engine, Base, get_db
from app.models import WorkflowRun, AgentEvent

# Create database tables
Base.metadata.create_all(bind=engine)

from app.telegram_bot import setup_telegram, stop_telegram

app = FastAPI(title="AI Orchestration Platform")

@app.on_event("startup")
async def startup_event():
    import asyncio
    asyncio.create_task(setup_telegram())

@app.on_event("shutdown")
async def shutdown_event():
    await stop_telegram()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- WebSocket Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Just keep the connection open
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
# -------------------------

class TaskRequest(BaseModel):
    task_description: str

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/workflow")
async def run_workflow(request: TaskRequest, db: Session = Depends(get_db)):
    """
    Kicks off the Supervisor-led multi-agent workflow, logs to DB, and streams via WebSockets.
    """
    run_record = WorkflowRun(task_description=request.task_description, status="RUNNING")
    db.add(run_record)
    db.commit()
    db.refresh(run_record)

    # Let the frontend know we started
    await manager.broadcast({
        "run_id": run_record.id,
        "agent": "system",
        "update": {"status": "Workflow started"}
    })

    initial_state = {
        "task_description": request.task_description,
        "messages": [],
        "next_agent": None,
        "payment_id": None,
        "customer_id": None,
        "amount": None,
        "currency": None,
        "country": None,
        "payment_method": None,
        "error_code": None,
        "failure_reason": None,
        "recoverable": None,
        "telegram_chat_id": None,
        "email": None,
        "phone_number": None,
        "recovery_channel": None,
        "strategy": None,
        "draft_message": None,
        "final_message": None,
        "compliance_decision": None,
        "compliance_notes": None,
        "run_id": str(run_record.id),
        "status": "pending",
        "logs": [],
        "final_result": None,
    }
    
    final_state = initial_state.copy()
    try:
        # Use .astream() instead of .stream() so the server doesn't freeze!
        async for output in app_graph.astream(initial_state):
            # output is a dict like {"researcher": {"research_notes": "..."}}
            for node_name, state_update in output.items():
                
                # 1. Log event to database
                db_event = AgentEvent(
                    run_id=run_record.id, 
                    agent_name=node_name, 
                    event_type="agent_finished", 
                    event_data=state_update
                )
                db.add(db_event)
                db.commit()
                
                # 2. Broadcast live event to WebSockets
                await manager.broadcast({
                    "run_id": run_record.id,
                    "agent": node_name,
                    "update": state_update
                })
                
                # Update tracking state
                final_state.update(state_update)

        run_record.status = "COMPLETED"
        run_record.final_result = final_state.get("final_result")
        await manager.broadcast({"run_id": run_record.id, "agent": "system", "update": {"status": "Completed"}})
        
    except Exception as e:
        run_record.status = "FAILED"
        run_record.final_result = str(e)
        await manager.broadcast({"run_id": run_record.id, "agent": "system", "update": {"error": str(e)}})
    finally:
        db.commit()
    
    return {
        "status": run_record.status,
        "task": request.task_description,
        "final_result": run_record.final_result,
        "run_id": run_record.id,
        "full_state_snapshot": final_state
    }
