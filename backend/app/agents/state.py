import operator
from typing import TypedDict, Annotated, Sequence, Optional
from langchain_core.messages import BaseMessage

class WorkflowState(TypedDict):
    """
    State shared across all agents in the LangGraph workflow.
    """
    messages: Annotated[Sequence[BaseMessage], operator.add]
    task_description: str
    next_agent: Optional[str]
    
    # Core identifiers
    payment_id: Optional[str]
    customer_id: Optional[str]
    amount: Optional[float]
    currency: Optional[str]
    country: Optional[str]
    payment_method: Optional[str]

    # Failure data
    error_code: Optional[str]
    failure_reason: Optional[str]
    recoverable: Optional[bool]

    # Customer contact
    telegram_chat_id: Optional[str]
    email: Optional[str]
    phone_number: Optional[str]

    # Recovery plan
    recovery_channel: Optional[str]
    strategy: Optional[str]

    # Message
    draft_message: Optional[str]
    final_message: Optional[str]
    compliance_decision: Optional[str]
    compliance_notes: Optional[str]
    
    # Final Result for UI
    final_result: Optional[str]
