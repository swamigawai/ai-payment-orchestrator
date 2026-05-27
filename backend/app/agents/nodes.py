import os
import json
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_groq import ChatGroq
from app.agents.state import WorkflowState

def get_llm():
    # Using LLaMA 3 70B via Groq for high performance and speed.
    # It automatically picks up GROQ_API_KEY from the environment.
    return ChatGroq(model="llama3-70b-8192", temperature=0.2)

def supervisor_node(state: WorkflowState):
    llm = get_llm()
    task = state.get("task_description", "")
    current = state.get("next_agent")
    
    # Simple hardcoded routing for the scaffold.
    # In a full version, we prompt Groq to decide:
    # "Given task X and current state Y, output JSON {"next_agent": "..."}"
    if not current:
        return {"next_agent": "researcher"}
    elif current == "researcher":
        return {"next_agent": "writer"}
    elif current == "writer":
        return {"next_agent": "reviewer"}
        
    return {"next_agent": "FINISH"}

def researcher_node(state: WorkflowState):
    llm = get_llm()
    task = state.get("task_description", "")
    
    prompt = [
        SystemMessage(content="You are the RESEARCHER AGENT. Gather, organize, and summarize information briefly. Return 2-3 bullet points."),
        HumanMessage(content=f"Please research the following task: {task}")
    ]
    
    response = llm.invoke(prompt)
    return {"research_notes": response.content}

def writer_node(state: WorkflowState):
    llm = get_llm()
    notes = state.get("research_notes", "")
    
    prompt = [
        SystemMessage(content="You are the WRITER AGENT. Turn research notes into a clear, structured markdown response. Be concise."),
        HumanMessage(content=f"Write a response based on these notes:\n{notes}")
    ]
    
    response = llm.invoke(prompt)
    return {"draft_content": response.content}

def reviewer_node(state: WorkflowState):
    llm = get_llm()
    task = state.get("task_description", "")
    draft = state.get("draft_content", "")
    
    prompt = [
        SystemMessage(content="You are the REVIEWER AGENT. Check the content for quality and task alignment. Append [APPROVED] if good, or suggest edits."),
        HumanMessage(content=f"Task: {task}\n\nDraft:\n{draft}\n\nPlease review.")
    ]
    
    response = llm.invoke(prompt)
    return {"final_result": response.content}
