import { useState } from 'react'

function App() {
  const [task, setTask] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runWorkflow = async () => {
    setLoading(true)
    setResult(null)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_description: task })
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error(error)
      setResult({ error: "Failed to connect to backend." })
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>AI Agent Orchestration Platform</h1>
      <p>Submit a task to the Supervisor Agent to kick off the multi-agent workflow.</p>
      
      <div style={{ marginBottom: '1rem' }}>
        <textarea 
          style={{ width: '100%', height: '100px', padding: '0.5rem', fontFamily: 'inherit' }}
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="e.g. Research the impact of AI on software engineering and write a short summary."
        />
      </div>
      
      <button 
        onClick={runWorkflow}
        disabled={loading || !task.trim()}
        style={{ 
          padding: '0.5rem 1rem', 
          background: loading ? '#ccc' : '#0070f3', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: loading ? 'not-allowed' : 'pointer' 
        }}
      >
        {loading ? 'Running Workflow (this may take a few seconds)...' : 'Run Workflow'}
      </button>

      {result && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '4px', border: '1px solid #ddd' }}>
          <h2>Workflow Result</h2>
          {result.error ? (
            <p style={{ color: 'red' }}>{result.error}</p>
          ) : (
            <>
              <h3>Final Output</h3>
              <div style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: '1rem', border: '1px solid #eee' }}>
                {result.final_result}
              </div>
              
              <details style={{ marginTop: '1rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Full Workflow State</summary>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', background: '#eee', padding: '1rem', overflowX: 'auto', marginTop: '0.5rem' }}>
                  {JSON.stringify(result.full_state_snapshot, null, 2)}
                </pre>
              </details>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default App
