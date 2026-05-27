import operator
from typing import TypedDict, Annotated, Sequence, Optional
from langchain_core.messages import BaseMessage

class WorkflowState(TypedDict):
    """
    State shared across all agents in the LangGraph workflow.
    """
    messages: Annotated[Sequence[BaseMessage], operator.add]
    task_description: str
    
    # Internal agent passing state
    next_agent: Optional[str]
    
    # Artifacts produced by agents
    research_notes: Optional[str]
    draft_content: Optional[str]
    review_feedback: Optional[str]
    final_result: Optional[str]
