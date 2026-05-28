import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base

def generate_uuid():
    return str(uuid.uuid4())

class WorkflowRun(Base):
    __tablename__ = "workflow_runs"

    id = Column(String, primary_key=True, default=generate_uuid)
    task_description = Column(Text, nullable=False)
    status = Column(String, default="RUNNING") # RUNNING, COMPLETED, FAILED
    final_result = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    events = relationship("AgentEvent", back_populates="run", cascade="all, delete-orphan")

class AgentEvent(Base):
    __tablename__ = "agent_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    run_id = Column(String, ForeignKey("workflow_runs.id"), nullable=False)
    agent_name = Column(String, nullable=False) # e.g. supervisor, researcher
    event_type = Column(String, nullable=False) # e.g. started, finished, tool_called
    event_data = Column(JSON, nullable=True) # Full state snapshot or specific data
    timestamp = Column(DateTime, default=datetime.utcnow)

    run = relationship("WorkflowRun", back_populates="events")
