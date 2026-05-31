import os
import json
from dotenv import load_dotenv
load_dotenv()
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_groq import ChatGroq
from app.agents.state import WorkflowState

def get_llm():
    return ChatGroq(model="llama-3.3-70b-versatile", temperature=0.1)

async def event_ingestor_node(state: WorkflowState):
    llm = get_llm()
    task = state.get("task_description", "")
    
    prompt = [
        SystemMessage(content="""You are the Event Ingestor Agent. Normalize `payment_failed` events into the shared state.
Key behaviors:
- Never fabricate data; only map what is provided.
- If data is missing, output null for that field. Do not invent mock data.
Safety:
- Do not log sensitive card details or raw PAN; log only necessary metadata.
Output exactly as a valid JSON object with keys: payment_id, customer_id, amount, currency, country, payment_method, error_code.
No markdown or backticks."""),
        HumanMessage(content=f"Raw Event: {task}")
    ]
    response = await llm.ainvoke(prompt)
    try:
        data = json.loads(response.content.strip().replace("```json", "").replace("```", ""))
        return data
    except Exception as e:
        return {"error_code": "parse_failure"}

async def reason_classifier_node(state: WorkflowState):
    llm = get_llm()
    err = state.get("error_code", "unknown")
    amount = state.get("amount", 0)
    
    prompt = [
        SystemMessage(content="""You are the Reason Classifier Agent. Map raw error codes into business-level reasons and a `recoverable` flag.
Key behaviors:
- Use simple categories (e.g., issuer_decline, insufficient_funds, 3ds_failure).
- If uncertain, mark reason as 'unknown' and recoverable as False.
Safety:
- Do not blame the customer; keep internal language neutral.
Output exactly as a valid JSON object with keys: 'failure_reason' (str) and 'recoverable' (bool).
No markdown or backticks."""),
        HumanMessage(content=f"Error Code: {err}, Amount: {amount}")
    ]
    response = await llm.ainvoke(prompt)
    try:
        data = json.loads(response.content.strip().replace("```json", "").replace("```", ""))
        return {"failure_reason": data.get("failure_reason", "unknown"), "recoverable": data.get("recoverable", False)}
    except:
        return {"failure_reason": "classification_failed", "recoverable": False}

async def recovery_channel_planner_node(state: WorkflowState):
    llm = get_llm()
    reason = state.get("failure_reason", "")
    country = state.get("country", "")
    
    prompt = [
        SystemMessage(content="""You are the Recovery Channel Planner. Decide channel and strategy.
Key behaviors:
- Use country + available contact details to choose channel. If Telegram is supported/present, choose "telegram", else "email".
- Choose strategy based on reason:
  - issuer_decline -> "explain_and_retry"
  - insufficient_funds -> "suggest_alt_method"
  - 3ds_failure -> "explain_3ds_retry"
Safety:
- Avoid channels not allowed by configuration.
Output exactly as a valid JSON object with keys: 'strategy' (str) and 'recovery_channel' (str). No markdown."""),
        HumanMessage(content=f"Failure Reason: {reason}\nCountry: {country}")
    ]
    response = await llm.ainvoke(prompt)
    try:
        data = json.loads(response.content.strip().replace("```json", "").replace("```", ""))
        return {"strategy": data.get("strategy"), "recovery_channel": data.get("recovery_channel", "telegram")}
    except:
        return {"strategy": "explain_and_retry", "recovery_channel": "telegram"}

async def customer_agent_node(state: WorkflowState):
    llm = get_llm()
    reason = state.get("failure_reason", "")
    strategy = state.get("strategy", "")
    amount = state.get("amount", 0)
    task_desc = state.get("task_description", "")
    feedback = state.get("compliance_notes", "")
    
    system_prompt = """You are the Customer Agent. Generate a perfectly balanced, professional, and empathetic customer-facing message.
Key behaviors:
- Provide a detailed but easy-to-read explanation (around 3-5 sentences). Not too short, not a wall of text.
- Greet the user politely.
- Use specific context from the 'Original Event' (like their user ID, card ending, or specific plan if mentioned) to make the message highly personalized.
- State that their payment of ${amount} failed and explain the reason contextually without blaming them.
- Provide a clear, actionable next step based on the strategy.
- End with a polite sign-off from 'The Yuno Team'.
Safety:
- Do not expose raw internal error codes (translate them to customer-friendly terms)."""

    if feedback and state.get("compliance_decision") == "REVISION_REQUIRED":
         system_prompt += f"\nWARNING: Your previous draft was rejected by Compliance. You MUST fix it based on this feedback: {feedback}"
         
    prompt = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"Original Event: {task_desc}\nReason: {reason}\nStrategy: {strategy}\nAmount: {amount}")
    ]
    response = await llm.ainvoke(prompt)
    return {"draft_message": response.content}

async def compliance_agent_node(state: WorkflowState):
    llm = get_llm()
    draft = state.get("draft_message", "")
    
    prompt = [
        SystemMessage(content="""You are the Compliance Agent. Review and approve/block messages.
Key behaviors:
- Check message against safety/policy rules.
- Return structured decisions (APPROVED, REVISION_REQUIRED, BLOCKED).
- Provide clear, concise feedback for revisions.
Safety:
- High priority on guarding customer privacy and legal wording. Ensure NO raw error codes are present.
Output exactly as a valid JSON object with keys: 'compliance_decision' (APPROVED/REVISION_REQUIRED/BLOCKED) and 'compliance_notes' (str). No markdown."""),
        HumanMessage(content=f"Draft Message: {draft}")
    ]
    response = await llm.ainvoke(prompt)
    try:
        data = json.loads(response.content.strip().replace("```json", "").replace("```", ""))
        return {"compliance_decision": data.get("compliance_decision", "APPROVED"), "compliance_notes": data.get("compliance_notes", "")}
    except:
        return {"compliance_decision": "APPROVED", "compliance_notes": ""}

async def supervisor_node(state: WorkflowState):
    current = state.get("next_agent")
    decision = state.get("compliance_decision")
    
    if not current:
        return {"next_agent": "event_ingestor"}
    elif current == "event_ingestor":
        return {"next_agent": "reason_classifier"}
    elif current == "reason_classifier":
        return {"next_agent": "recovery_channel_planner"}
    elif current == "recovery_channel_planner":
        return {"next_agent": "customer_agent"}
    elif current == "customer_agent":
        return {"next_agent": "compliance_agent"}
    elif current == "compliance_agent":
        if decision == "REVISION_REQUIRED":
            return {"next_agent": "customer_agent"} 
        else:
            return {"next_agent": "FINISH", "final_message": state.get("draft_message"), "final_result": state.get("draft_message")}
            
    return {"next_agent": "FINISH"}
