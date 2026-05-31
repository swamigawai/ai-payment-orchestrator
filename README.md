# Yuno: AI Payment Recovery Orchestrator

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.11%2B-blue)
![React](https://img.shields.io/badge/React-18-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green)
![LangGraph](https://img.shields.io/badge/Architecture-LangGraph-purple)

An enterprise-grade, autonomous multi-agent system designed to combat involuntary churn and recover failed payments through context-aware, highly personalized customer outreach.

<br/>



https://github.com/user-attachments/assets/72a6083d-514f-482c-b6bc-ccef19b64c78


<br/>

---

## The Solution
Yuno is an automated pipeline that ingests raw bank webhooks and transforms them into precision-targeted, actionable recovery messages. We treat payment failure recovery as a deterministic state-machine problem, not just a static email sequence.

## How it works

* **Ingestion:** The system intercepts raw payment failure webhooks and normalizes them into a strict, validated Pydantic state, stripping out sensitive Personal Identifiable Information (PII).
* **Classification:** An AI Reason Classifier analyzes internal bank error codes (e.g., `INS_FUNDS`, `DO_NOT_HONOR`) and translates them into actionable human business logic in under 5 seconds.
* **Routing:** The Channel Planner dynamically selects the optimal recovery strategy based on user geography and the severity of the failure (e.g., routing to Telegram for immediate action vs. Email for standard follow-ups).
* **Drafting:** The Customer Agent drafts a localized, empathetic, and highly personalized recovery message pulling contextual data from the original event.
* **Compliance Audit:** Before any message is dispatched, an independent Compliance Agent evaluates the draft. If it detects a policy violation (like raw error codes or aggressive language), it sends the draft back for revision, creating a secure feedback loop with zero hallucination leakage.

## Tech Stack
Our architecture is built for speed, fault tolerance, and deep real-time observability.

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | <img src="https://skillicons.dev/icons?i=react,vite,tailwind" height="48" alt="React Vite Tailwind" /> | Real-time orchestration dashboard and Live Execution Monitor via WebSockets. |
| **Backend** | <img src="https://skillicons.dev/icons?i=python,fastapi,sqlite" height="48" alt="Python FastAPI SQLite" /> | High-performance microservices handling API routing and state management. |
| **Agent Architecture** | <img src="https://img.shields.io/badge/LangGraph-1C1C1C?style=for-the-badge&logo=langchain&logoColor=white" height="48" alt="LangGraph" /> | Deterministic state machine orchestrating 5 specialized micro-agents. |
| **LLM Inference** | <img src="https://img.shields.io/badge/Groq_Llama_3-F56B2A?style=for-the-badge&logo=meta&logoColor=white" height="48" alt="Groq Llama 3" /> | Ultra-low latency inference for high-speed parsing, reasoning, and drafting. |
| **Integrations**| <img src="https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" height="48" alt="Telegram" /> | Powers the conversational AI Intent Router for Tier-1 customer support. |
| **Resilience** | <img src="https://img.shields.io/badge/Tenacity-000000?style=for-the-badge&logo=python&logoColor=white" height="48" alt="Tenacity" /> | Exponential backoff retry decorators ensuring high availability during API turbulence. |

## Visuals

| Live Execution Monitor | Workflow Builder |
| :---: | :---: |
| *(Insert Monitor Screenshot Here)* | *(Insert Workflow Screenshot Here)* |

| Agent Configuration | Telegram Integration |
| :---: | :---: |
| *(Insert Config Screenshot Here)* | *(Insert Telegram Screenshot Here)* |

---
## Local Setup & Installation

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
