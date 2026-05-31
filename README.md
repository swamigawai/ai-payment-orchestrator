# Yuno: AI Payment Recovery Orchestrator

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.11%2B-blue)
![React](https://img.shields.io/badge/React-18-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green)
![LangGraph](https://img.shields.io/badge/Architecture-LangGraph-purple)

An enterprise-grade, autonomous multi-agent system designed to combat involuntary churn and recover failed payments through context-aware, highly personalized customer outreach.

---

## 1. Executive Summary & The Business Problem

Involuntary churn—the loss of customers due to failed payments from expired cards, insufficient funds, or bank declines—costs digital businesses billions of dollars annually. Traditional systems rely on static retry logic and generic, automated email sequences that suffer from exceptionally low conversion rates.

**The Solution:** Yuno provides a specialized, multi-agent AI workforce that ingests raw bank webhooks, determines the precise business context behind the payment failure, selects the optimal recovery channel based on historical heuristics, and drafts a hyper-personalized recovery message. Crucially, the system operates under strict enterprise compliance constraints, ensuring that automated outreach remains both effective and legally sound.

---

## 2. Multi-Agent Architecture (LangGraph)

To ensure scalability and maintainability, this platform abandons the brittle approach of monolithic LLM prompts. Instead, it utilizes **LangGraph** to orchestrate a deterministic state machine populated by five specialized micro-agents:

1. **Event Ingestor:** Normalizes unstructured, raw bank webhooks into a strict, validated Pydantic state, stripping out sensitive Personal Identifiable Information (PII) before it enters the LLM context window.
2. **Reason Classifier:** Analyzes internal bank error codes (e.g., `INS_FUNDS`, `DO_NOT_HONOR`) and translates them into actionable human business logic.
3. **Channel Planner:** Dynamically routes the recovery strategy based on user geography, demographic data, and the severity of the failure (e.g., routing to Telegram for immediate action vs. Email for standard follow-ups).
4. **Customer Agent:** Drafts the localized, empathetic, and actionable recovery message, pulling contextual data from the original event to drive conversion.
5. **Compliance Agent:** Acts as an independent auditor to enforce safety boundaries.

---

## 3. AI Safety and The Compliance Feedback Loop

Deploying Generative AI in an enterprise production environment requires strict safety rails to prevent hallucination leakage. This architecture implements a **Deterministic Supervisor** alongside a rigorous **Compliance Feedback Loop**.

Before any generated message is dispatched to a customer, it must be intercepted and evaluated by the Compliance Agent. If the Compliance Agent detects a policy violation—such as the inclusion of a raw internal error code, aggressive language, or unapproved claims—it blocks the outbound network request. The draft is then routed back to the Customer Agent accompanied by a `REVISION_REQUIRED` flag and specific correction feedback. The state machine cycles through this loop until the message achieves an `APPROVED` status, guaranteeing zero hallucination leakage to the end user.

---

## 4. Production-Ready Features

* **Real-Time Observability via WebSockets:** The React frontend features a Live Execution Monitor, establishing a persistent WebSocket connection to stream millisecond-by-millisecond state transitions from the LangGraph backend. This provides deep observability into the autonomous reasoning process.
* **Robust Fault Tolerance:** Network requests to external LLM providers are inherently unstable. To mitigate this, all LLM nodes are wrapped in Exponential Backoff Retry decorators using the `Tenacity` framework. Furthermore, the system utilizes custom Regex extraction for deterministic JSON parsing, ensuring high availability even during periods of LLM API turbulence.
* **Conversational Intent Routing:** The integrated Telegram bot extends beyond one-way automated messaging. It is equipped with an AI Intent Router (powered by `llama-3.3-70b-versatile`) that intercepts customer replies, classifies whether the input is a follow-up query or a system command, and handles the interaction dynamically as a Tier-1 customer support agent.

---

## 5. Technical Stack

* **Backend Orchestration:** Python, FastAPI, LangGraph, LangChain, SQLAlchemy
* **External Integrations:** Python-Telegram-Bot
* **Frontend Dashboard:** React, Vite, TailwindCSS (Nova Design System)
* **AI Provider:** Groq (Llama-3.3-70b-versatile) for ultra-low latency inference.

---

## 6. Local Setup & Installation

### Backend Environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```
*Note: You must create a `.env` file in the `backend` directory containing your `GROQ_API_KEY` and `TELEGRAM_TOKEN` prior to initialization.*

```bash
# Initialize the FastAPI server and Telegram polling service
uvicorn app.main:app --reload
```

### Frontend Environment
```bash
cd frontend
npm install
npm run dev
```

Navigate your browser to `http://localhost:5173` to access the Orchestration Dashboard.

---
*Architected and developed as a modern, scalable solution for intelligent payment recovery.*
