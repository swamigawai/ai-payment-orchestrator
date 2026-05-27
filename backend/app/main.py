from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.agents.graph import app_graph

app = FastAPI(title="AI Orchestration Platform")

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskRequest(BaseModel):
    task_description: str

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/workflow")
async def run_workflow(request: TaskRequest):
    """
    Kicks off the Supervisor-led multi-agent workflow.
    """
    initial_state = {
        "task_description": request.task_description,
        "messages": [],
        "next_agent": None,
        "research_notes": None,
        "draft_content": None,
        "review_feedback": None,
        "final_result": None,
    }
    
    # Run the graph synchronously until completion
    final_state = app_graph.invoke(initial_state)
    
    return {
        "status": "completed",
        "task": request.task_description,
        "final_result": final_state.get("final_result"),
        "full_state_snapshot": final_state
    }
