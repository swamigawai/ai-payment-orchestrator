from langgraph.graph import StateGraph, END
from app.agents.state import WorkflowState
from app.agents.nodes import (
    supervisor_node,
    researcher_node,
    writer_node,
    reviewer_node,
)

def build_graph():
    """
    Constructs the StateGraph using the Handoff/Supervisor pattern.
    """
    workflow = StateGraph(WorkflowState)
    
    # Add the agent nodes
    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("researcher", researcher_node)
    workflow.add_node("writer", writer_node)
    workflow.add_node("reviewer", reviewer_node)
    
    # The supervisor decides what to do next
    def router(state: WorkflowState):
        next_agent = state.get("next_agent")
        if next_agent == "FINISH":
            return END
        return next_agent

    # The supervisor is the central router
    workflow.add_conditional_edges("supervisor", router)
    
    # All workers return control to the supervisor after finishing
    workflow.add_edge("researcher", "supervisor")
    workflow.add_edge("writer", "supervisor")
    workflow.add_edge("reviewer", "supervisor")
    
    # Work begins with the supervisor
    workflow.set_entry_point("supervisor")
    
    return workflow.compile()

# Compile graph once to be used by FastAPI endpoints
app_graph = build_graph()
