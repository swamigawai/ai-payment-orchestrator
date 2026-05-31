# 🚀 Yuno: AI Payment Recovery Orchestrator

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.11%2B-blue)
![React](https://img.shields.io/badge/React-18-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green)
![LangGraph](https://img.shields.io/badge/Architecture-LangGraph-purple)

**An enterprise-grade, autonomous multi-agent system designed to combat involuntary churn and recover failed payments through context-aware, highly personalized customer outreach.**

---

## 📖 The Business Problem
Involuntary churn (failed payments due to expired cards, insufficient funds, or bank declines) costs businesses billions annually. Traditional retry logic is static, and generic "Update your card" emails have abysmal conversion rates. 

**The Solution:** A specialized, multi-agent AI workforce that ingests raw bank webhooks, determines the precise business reason for the failure, selects the optimal recovery channel, and drafts a hyper-personalized recovery message—all while adhering to strict enterprise compliance constraints.

---

## 🧠 Multi-Agent Architecture
This platform moves away from brittle, monolithic LLM prompts. Instead, it utilizes **LangGraph** to orchestrate a deterministic state machine populated by 5 specialized micro-agents:

1. 📥 **Event Ingestor:** Normalizes unstructured, messy webhooks into a strict Pydantic state.
2. 🔍 **Reason Classifier:** Translates raw internal bank error codes (e.g., `INS_FUNDS`) into human business logic.
3. 🗺️ **Channel Planner:** Routes the recovery strategy based on user geography and failure severity (Telegram vs. Email).
4. ✍️ **Customer Agent:** Drafts the localized, empathetic, and actionable recovery message.
5. 🛡️ **Compliance Agent:** An independent auditor that ensures zero raw error codes or aggressive language reach the customer.

---

## 🔒 The Crown Jewel: AI Safety & The Compliance Loop
Generative AI in enterprise production requires strict safety rails. This architecture implements a **Deterministic Supervisor** and a strict **Compliance Feedback Loop**. 

Before any message is dispatched, the **Compliance Agent** intercepts it. If it detects a policy violation, it blocks the outbound network request and sends the draft *back* to the Customer Agent with a `REVISION_REQUIRED` flag and specific feedback. The system loops until the message is explicitly marked `APPROVED`. **Zero hallucination leakage.**

---

## ⚡ Core Features

* **Real-Time Observability (WebSockets):** The React frontend features a Live Execution Monitor, streaming millisecond-by-millisecond state transitions from the LangGraph backend.
* **Robust Fault Tolerance:** All LLM nodes are wrapped in Exponential Backoff Retry decorators (`Tenacity`) and utilize custom Regex extraction for deterministic JSON parsing, ensuring high availability even during LLM API turbulence.
* **Conversational Intent Router:** The integrated Telegram bot doesn't just send automated messages. It is equipped with an AI Intent Router (`llama-3.3-70b-versatile`) that intercepts customer replies, identifies follow-up queries, and handles them dynamically as a customer support agent.

---

## 🛠️ Tech Stack
* **Backend:** Python, FastAPI, LangGraph, LangChain, SQLAlchemy, Python-Telegram-Bot
* **Frontend:** React, Vite, TailwindCSS (Nova Design System)
* **AI Provider:** Groq (Llama-3.3-70b-versatile) for ultra-low latency inference.

---

## 🚀 Local Setup & Installation

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```
*Create a `.env` file in the `backend` directory with your `GROQ_API_KEY` and `TELEGRAM_TOKEN`.*

```bash
# Start the backend server and Telegram polling
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open your browser to `http://localhost:5173` to access the Orchestration Dashboard.

---
*Architected and developed as a modern solution for intelligent payment recovery.*
