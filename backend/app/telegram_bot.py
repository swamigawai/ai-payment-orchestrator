import os
import asyncio
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from app.agents.graph import app_graph
from app.core.db import SessionLocal
from app.models import WorkflowRun, AgentEvent

TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN")

telegram_app = None
if TELEGRAM_TOKEN:
    telegram_app = Application.builder().token(TELEGRAM_TOKEN).build()

GLOBAL_CHAT_ID = None

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    global GLOBAL_CHAT_ID
    GLOBAL_CHAT_ID = update.effective_chat.id
    await update.message.reply_text("Hello! I am connected to the orchestrator. Trigger a playbook from the website, and I will send the recovery message here!")

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    global GLOBAL_CHAT_ID
    GLOBAL_CHAT_ID = update.effective_chat.id
    user_message = update.message.text
    chat_id = update.effective_chat.id

    try:
        from langchain_groq import ChatGroq
        from langchain_core.messages import SystemMessage, HumanMessage
        llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.5)
        
        system_prompt = """You are a highly polite and professional customer support AI for Yuno. 
Analyze the user's message.
If the message is explicitly a system test or command to simulate a failed payment (e.g., 'Simulate a failed payment', 'User tried paying...', 'Declined card ending...'), reply EXACTLY with the word 'PLAYBOOK_TRIGGER'.
If the message is a normal customer query or greeting (e.g., 'Why did my card fail?', 'Hi', 'Help me', 'Can I update my card?'), reply as a polite customer service representative assisting them, but DO NOT say 'PLAYBOOK_TRIGGER'."""

        response = llm.invoke([SystemMessage(content=system_prompt), HumanMessage(content=user_message)])
        ai_reply = response.content.strip()
    except Exception as e:
        ai_reply = "PLAYBOOK_TRIGGER"

    if "PLAYBOOK_TRIGGER" not in ai_reply:
        # It's a standard customer query, just reply politely
        await context.bot.send_message(chat_id=chat_id, text=ai_reply)
        return

    await context.bot.send_message(chat_id=chat_id, text="🚀 Simulating Payment Failure Event...")

    db = SessionLocal()
    run_record = WorkflowRun(task_description=user_message, status="RUNNING")
    db.add(run_record)
    db.commit()
    db.refresh(run_record)

    initial_state = {
        "task_description": user_message,
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
        "telegram_chat_id": str(chat_id),
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
        async for output in app_graph.astream(initial_state):
            for node_name, state_update in output.items():
                db_event = AgentEvent(
                    run_id=run_record.id, 
                    agent_name=node_name, 
                    event_type="agent_finished", 
                    event_data=state_update
                )
                db.add(db_event)
                db.commit()
                final_state.update(state_update)

        run_record.status = "COMPLETED"
        final_msg = final_state.get("final_message") or final_state.get("draft_message")
        run_record.final_result = final_msg
        
        # Outbound messages: Send final approved message to Telegram
        if final_msg:
            await context.bot.send_message(chat_id=chat_id, text=final_msg)
        else:
            await context.bot.send_message(chat_id=chat_id, text="⚠️ Recovery playbook finished, but no valid message was drafted.")
            
    except Exception as e:
        run_record.status = "FAILED"
        run_record.final_result = str(e)
        await context.bot.send_message(chat_id=chat_id, text=f"❌ Workflow Error: {str(e)}")
    finally:
        db.commit()
        db.close()

async def setup_telegram():
    if not telegram_app:
        print("No TELEGRAM_TOKEN found, skipping Telegram bot setup.")
        return
        
    telegram_app.add_handler(CommandHandler("start", start_command))
    telegram_app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    await telegram_app.initialize()
    await telegram_app.start()
    
    # We leave polling on for local testing since Webhooks require Ngrok
    await telegram_app.updater.start_polling()
    print("Telegram bot polling started!")

async def stop_telegram():
    if telegram_app:
        await telegram_app.updater.stop()
        await telegram_app.stop()
        await telegram_app.shutdown()
