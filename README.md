# AI Agent Orchestration Platform

A multi-agent workflow platform using **FastAPI**, **LangGraph**, and **React**. It utilizes a Supervisor-pattern to coordinate a Researcher, Writer, and Reviewer agent.

## Project Structure
- `backend/`: Python + FastAPI application holding the LangGraph agent state and logic. Agents use Groq LLMs.
- `frontend/`: React frontend (Vite) to easily dispatch workflows to the backend and visualize state.

## Setup Instructions

### Backend
1. Navigate to the `backend/` folder: `cd backend`
2. Set up virtual env: `python -m venv venv`
3. Activate the venv:
   - Windows: `.\venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Create a `.env` file from the example and add your Groq API key:
   `cp .env.example .env`
6. Run the server: `fastapi dev app/main.py`

### Frontend
1. Navigate to the `frontend/` folder: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

Navigate to the localhost port provided by Vite, type a task description, and run the workflow!
