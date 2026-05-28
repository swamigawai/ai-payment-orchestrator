from langgraph.graph import StateGraph, END
from app.agents.state import WorkflowState
from app.agents.nodes import (
    supervisor_node,
    event_ingestor_node,
    reason_classifier_node,
    recovery_channel_planner_node,
    customer_agent_node,
    compliance_agent_node
)

def build_graph():
    """
    Constructs the StateGraph using the Supervisor pattern for Payment Recovery.
    """
    workflow = StateGraph(WorkflowState)
    
    # Add the agent nodes
    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("event_ingestor", event_ingestor_node)
    workflow.add_node("reason_classifier", reason_classifier_node)
    workflow.add_node("recovery_channel_planner", recovery_channel_planner_node)
    workflow.add_node("customer_agent", customer_agent_node)
    workflow.add_node("compliance_agent", compliance_agent_node)
    
    # The supervisor decides what to do next
    def router(state: WorkflowState):
        next_agent = state.get("next_agent")
        if next_agent == "FINISH":
            return END
        return next_agent

    # The supervisor is the central router
    workflow.add_conditional_edges("supervisor", router)
    
    # All workers return control to the supervisor after finishing
    workflow.add_edge("event_ingestor", "supervisor")
    workflow.add_edge("reason_classifier", "supervisor")
    workflow.add_edge("recovery_channel_planner", "supervisor")
    workflow.add_edge("customer_agent", "supervisor")
    workflow.add_edge("compliance_agent", "supervisor")
    
    # Work begins with the supervisor
    workflow.set_entry_point("supervisor")
    
    return workflow.compile()

# Compile graph once to be used by FastAPI endpoints
app_graph = build_graph()
