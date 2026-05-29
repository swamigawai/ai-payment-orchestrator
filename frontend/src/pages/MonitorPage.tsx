import React, { useState, useEffect } from 'react';

export default function MonitorPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskDesc, setTaskDesc] = useState("Simulate a failed payment for user U-9942. Amount: $149.99. Error: INS_FUNDS");

  const mockRuns = [
    { id: "run_8819", time: "10 mins ago", status: "completed", cost: "$0.04" },
    { id: "run_8818", time: "45 mins ago", status: "completed", cost: "$0.03" },
    { id: "run_8817", time: "2 hours ago", status: "failed", cost: "$0.01" },
  ];

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:8000/ws');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.update && (data.update.status === "Completed" || data.update.error)) {
        setLoading(false);
      } else {
        setLogs(prev => [...prev, data]);
      }
    };
    return () => ws.close();
  }, []);

  const runWorkflow = async () => {
    setLoading(true);
    setLogs([]);
    try {
      await fetch('http://127.0.0.1:8000/api/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_description: taskDesc })
      });
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const exampleEvents = [
    "Simulate a failed payment for user U-9942. Amount: $149.99. Error: INS_FUNDS",
    "User from Brazil tried paying R$50 but bank returned FRAUD_SUSPICION.",
    "Declined card ending 4001 for customer JD-88. Reason: EXPIRED_CARD. Plan: $20/mo",
  ];

  return (
    <div className="flex h-full w-full gap-6">
      {/* Sidebar History */}
      <div className="w-64 bg-nova-surface shadow-sm border border-nova-surface-alt rounded-xl p-4 hidden lg:flex flex-col gap-4">
        <h3 className="text-nova-text font-bold text-lg mb-2">Recent Runs</h3>
        {mockRuns.map(r => (
          <div key={r.id} className="bg-nova-surface-alt p-3 rounded-lg border border-nova-surface-alt hover:border-nova-primary/50 cursor-pointer transition-colors">
            <div className="flex justify-between items-center mb-1">
              <span className="text-nova-primary font-mono text-xs">{r.id}</span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${r.status === 'completed' ? 'border border-nova-success text-nova-success bg-nova-success/10' : 'border border-nova-error text-nova-error bg-nova-error/10'}`}>
                {r.status}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-nova-text-muted mt-2">
              <span>{r.time}</span>
              <span className="text-nova-success font-mono">{r.cost}</span>
            </div>
          </div>
        ))}
        <div className="mt-auto flex flex-col gap-3">
            <div className="bg-nova-surface-alt p-4 rounded-xl border border-nova-primary/20">
                <h4 className="text-[10px] uppercase font-bold text-nova-text-muted tracking-wider mb-1">Recovered Revenue</h4>
                <div className="text-2xl font-bold text-nova-success">+₹2,500</div>
            </div>
            <button className="w-full bg-nova-surface hover:bg-nova-surface-alt text-nova-text border border-nova-surface-alt font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors shadow-sm" onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
              const a = document.createElement('a');
              a.setAttribute("href", dataStr);
              a.setAttribute("download", "compliance_audit_log.json");
              document.body.appendChild(a);
              a.click();
              a.remove();
            }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Export Audit Log
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Live Analytics Top Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-nova-surface p-4 rounded-xl border border-nova-surface-alt shadow-sm flex items-center justify-between">
            <span className="text-nova-text-muted text-sm font-bold uppercase">Success Rate</span>
            <span className="text-nova-success text-xl font-bold">94.2%</span>
          </div>
          <div className="bg-nova-surface p-4 rounded-xl border border-nova-surface-alt shadow-sm flex items-center justify-between">
            <span className="text-nova-text-muted text-sm font-bold uppercase">Active Agents</span>
            <span className="text-nova-primary text-xl font-bold">6</span>
          </div>
          <div className="bg-nova-surface p-4 rounded-xl border border-nova-surface-alt shadow-sm flex items-center justify-between">
            <span className="text-nova-text-muted text-sm font-bold uppercase">Tokens Used</span>
            <span className="text-nova-info text-xl font-bold">12,450</span>
          </div>
        </div>

        <div className="bg-nova-surface p-6 rounded-xl border border-nova-surface-alt shadow-md mb-6">
          <h2 className="text-xl font-bold text-nova-text mb-2">Simulate Event</h2>
          <p className="text-sm text-nova-text-muted mb-4">Trigger a mock payment failure to test the playbook.</p>
          <div className="flex gap-4 mb-4">
            <input 
              className="flex-1 bg-nova-bg text-nova-text p-4 rounded-lg border border-nova-surface-alt focus:border-nova-primary focus:outline-none font-mono text-sm placeholder-nova-text-muted/50 transition-colors"
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
            />
            <button 
              className="bg-nova-primary hover:bg-nova-primary-dark text-white font-bold py-4 px-8 rounded-lg border border-nova-primary-dark transition-all disabled:opacity-50 shadow-sm whitespace-nowrap"
              onClick={runWorkflow}
              disabled={loading}
            >
              {loading ? "Simulating..." : "Trigger Playbook"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-bold uppercase text-nova-text-muted mt-2 mr-2">Quick Scenarios:</span>
            {exampleEvents.map((ev, idx) => (
                <button 
                  key={idx}
                  onClick={() => setTaskDesc(ev)}
                  className="text-xs bg-nova-surface-alt hover:bg-nova-primary/20 hover:text-nova-primary text-nova-text-muted border border-nova-surface-alt hover:border-nova-primary/50 px-3 py-1.5 rounded-full transition-colors truncate max-w-[250px]"
                  title={ev}
                >
                  {ev}
                </button>
            ))}
          </div>
        </div>

        <h2 className="text-xl font-bold text-nova-text mb-4">Live Execution Monitor</h2>
        {/* Log Viewer */}
        <div className="w-full font-mono text-[13px] bg-nova-surface shadow-md rounded-xl overflow-hidden border border-nova-surface-alt flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 bg-nova-surface-alt px-4 py-3 border-b border-nova-surface-alt">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-nova-error" />
              <div className="h-3 w-3 rounded-full bg-nova-warning" />
              <div className="h-3 w-3 rounded-full bg-nova-success" />
            </div>
            <div className="flex-1 text-center">
              <span className="truncate text-xs font-sans text-nova-text-muted font-medium">
                orchestrator-terminal
              </span>
            </div>
            <div className="w-[52px]" />
          </div>
          
          <div className="p-5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-nova-surface-alt scrollbar-track-transparent">
            {logs.length === 0 && (
              <div className="flex h-full items-center justify-center">
                <p className="text-nova-text-muted font-sans">No active runs. Trigger the playbook above.</p>
              </div>
            )}
            
            {logs.map((log, idx) => {
              let agentColor = 'text-nova-info'
              if (log.agent === 'event_ingestor') agentColor = 'text-nova-primary'
              if (log.agent === 'reason_classifier') agentColor = 'text-nova-primary'
              if (log.agent === 'recovery_channel_planner') agentColor = 'text-nova-primary'
              if (log.agent === 'customer_agent') agentColor = 'text-nova-primary'
              if (log.agent === 'compliance_agent') agentColor = 'text-nova-success'
              if (log.agent === 'supervisor') agentColor = 'text-nova-text-muted'
              if (log.update?.error) agentColor = 'text-nova-error'

              return (
                <div key={idx} className="mb-4 leading-relaxed whitespace-pre-wrap">
                  <span>
                    <span className="text-nova-text-muted">
                      <span className="text-nova-info">nova</span>
                      <span className="text-nova-success">:</span>
                      <span className="text-nova-text-muted">~</span>
                      <span className="text-nova-primary">$</span>{" "}
                    </span>
                    <span className={agentColor}>
                      execute agent --name={log.agent}
                    </span>
                  </span>
                  
                  <div className="mt-1 text-nova-text">
                    {JSON.stringify(log.update, null, 2)}
                  </div>
                </div>
              )
            })}
            
            {loading && (
              <div className="leading-relaxed whitespace-pre-wrap animate-pulse">
                <span className="text-nova-text-muted">
                  <span className="text-nova-info">nova</span>
                  <span className="text-nova-success">:</span>
                  <span className="text-nova-text-muted">~</span>
                  <span className="text-nova-primary">$</span>{" "}
                </span>
                <span className="inline-block h-4 w-2 bg-nova-text-muted align-middle"></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
