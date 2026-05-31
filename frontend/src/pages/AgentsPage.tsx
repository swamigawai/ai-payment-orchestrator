import React, { useState } from 'react';
import { Settings, ShieldCheck, MessageSquare, MapPin, Database, ServerCog, Plus, X, Save } from 'lucide-react';

const initialAgents = [
  {
    id: 'event_ingestor',
    name: 'Event Ingestor',
    icon: <Database className="w-6 h-6 text-nova-primary" />,
    role: 'Listen for payment_failed events and normalize them into a common state format.',
    model: 'llama-3.3-70b-versatile',
    prompt: 'You are the Event Ingestor Agent. Normalize payment_failed events into the shared state. Never fabricate data; only map what is provided. Do not log sensitive card details.'
  },
  {
    id: 'reason_classifier',
    name: 'Reason Classifier',
    icon: <Settings className="w-6 h-6 text-nova-primary" />,
    role: 'Map raw error codes to business-level reasons (e.g. issuer_decline).',
    model: 'llama-3.3-70b-versatile',
    prompt: 'You are the Reason Classifier Agent. Map raw error codes into business-level reasons and a recoverable flag. Do not blame the customer; keep internal language neutral.'
  },
  {
    id: 'recovery_planner',
    name: 'Recovery Channel Planner',
    icon: <MapPin className="w-6 h-6 text-nova-primary" />,
    role: 'Decide how and where to attempt recovery based on reason and country.',
    model: 'llama-3.3-70b-versatile',
    prompt: 'You are the Recovery Channel Planner. Decide channel and strategy. Use country + contact details to choose Telegram or Email. Choose strategy based on reason.'
  },
  {
    id: 'customer_agent',
    name: 'Customer Agent',
    icon: <MessageSquare className="w-6 h-6 text-nova-primary" />,
    role: 'Draft customer-facing message localized and friendly.',
    model: 'llama-3.3-70b-versatile',
    prompt: 'You are the Customer Agent. Generate a concise, highly professional, and empathetic customer-facing message. Keep it brief (2-3 short sentences), explain the failure contextually without blame, provide a clear actionable next step, and sign off from The Yuno Team. Do not expose internal error codes.'
  },
  {
    id: 'compliance_agent',
    name: 'Compliance Agent',
    icon: <ShieldCheck className="w-6 h-6 text-nova-success" />,
    role: 'Review and approve/modify/block outgoing messages for safety.',
    model: 'llama-3.3-70b-versatile',
    prompt: 'You are the Compliance Agent. Review and approve/block messages. Return structured decisions (APPROVED, REVISION_REQUIRED). High priority on guarding privacy.'
  },
  {
    id: 'supervisor',
    name: 'Supervisor',
    icon: <ServerCog className="w-6 h-6 text-nova-info" />,
    role: 'Overall coordinator running the LangGraph state machine.',
    model: 'Deterministic Graph Router',
    prompt: 'Hardcoded Python router evaluating the state and advancing the graph sequence based on condition checks (e.g., Compliance Decision).'
  }
];

export default function AgentsPage() {
  const [agents, setAgents] = useState(initialAgents);
  const [activeAgent, setActiveAgent] = useState(agents[0]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null); // null means creating

  const handleOpenEdit = () => {
    setEditingAgent(activeAgent);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingAgent(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newName = formData.get('name') as string;
    const newModel = formData.get('model') as string;
    const newPrompt = formData.get('prompt') as string;
    
    if (editingAgent) {
      const updatedAgents = agents.map(a => 
        a.id === editingAgent.id 
          ? { ...a, name: newName, model: newModel, prompt: newPrompt } 
          : a
      );
      setAgents(updatedAgents);
      setActiveAgent(updatedAgents.find(a => a.id === editingAgent.id)!);
    } else {
      const newAgent = {
        id: `agent_${Date.now()}`,
        name: newName,
        icon: <Settings className="w-6 h-6 text-nova-primary" />,
        role: 'Custom user-defined agent.',
        model: newModel,
        prompt: newPrompt
      };
      setAgents([...agents, newAgent]);
      setActiveAgent(newAgent);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex w-full h-full gap-6 relative">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-max">
        <div className="col-span-full flex justify-between items-end mb-2">
            <div>
                <h2 className="text-2xl font-bold text-nova-text">Playbook Agents</h2>
                <p className="text-sm text-nova-text-muted">Configure your autonomous workforce.</p>
            </div>
            <button onClick={handleOpenCreate} className="bg-nova-primary hover:bg-nova-primary-dark text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                Create Agent
            </button>
        </div>
        {agents.map(a => (
          <div 
            key={a.id} 
            className={`p-6 rounded-xl border cursor-pointer transition-all shadow-sm ${a.id === activeAgent.id ? 'bg-nova-surface border-nova-primary shadow-md scale-[1.02]' : 'bg-nova-surface border-nova-surface-alt hover:shadow-md'}`}
            onClick={() => setActiveAgent(a)}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-lg border border-nova-surface-alt bg-nova-bg`}>
                {a.icon}
              </div>
              <div>
                <h3 className={`font-bold text-lg ${a.id === activeAgent.id ? 'text-nova-primary' : 'text-nova-text'}`}>{a.name}</h3>
                <p className="text-nova-text-muted text-sm font-mono">{a.id}</p>
              </div>
            </div>
            <p className="text-nova-text-muted text-sm line-clamp-2">{a.role}</p>
          </div>
        ))}
      </div>

      <div className="w-96 bg-nova-surface border border-nova-surface-alt shadow-lg rounded-xl p-6 flex flex-col h-full sticky top-0">
        <div className="flex items-center gap-4 mb-6">
          <div className={`p-4 rounded-xl border border-nova-surface-alt bg-nova-bg`}>
            {activeAgent.icon}
          </div>
          <div>
            <h2 className="text-nova-text font-bold text-2xl">{activeAgent.name}</h2>
            <div className="inline-block mt-2 px-3 py-1 bg-nova-surface-alt border border-nova-surface-alt rounded-full text-xs text-nova-primary font-mono font-bold">
              Model: {activeAgent.model}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="text-nova-text-muted font-bold uppercase text-xs mb-2">Role Description</h4>
          <p className="text-nova-text text-sm leading-relaxed">{activeAgent.role}</p>
        </div>

        <div className="flex-1 flex flex-col">
          <h4 className="text-nova-text-muted font-bold uppercase text-xs mb-2">System Prompt</h4>
          <div className="flex-1 bg-nova-bg border border-nova-surface-alt rounded-lg p-4 font-mono text-[13px] text-nova-info overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
            {activeAgent.prompt}
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-nova-surface-alt flex justify-end">
          <button onClick={handleOpenEdit} className="px-6 py-2 bg-nova-surface-alt hover:bg-nova-primary/10 hover:text-nova-primary text-nova-text border border-nova-surface-alt hover:border-nova-primary rounded-lg text-sm font-bold transition-all">
            Edit Agent Config
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-nova-text/20 backdrop-blur-sm">
          <div className="bg-nova-surface w-[500px] rounded-xl shadow-2xl border border-nova-surface-alt flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-nova-surface-alt">
              <h2 className="text-xl font-bold text-nova-text">{editingAgent ? "Edit Agent Config" : "Create New Agent"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-nova-text-muted hover:text-nova-error transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-nova-text-muted mb-1">Agent Name</label>
                <input 
                  name="name" 
                  defaultValue={editingAgent?.name || ''} 
                  required 
                  placeholder="e.g. Fraud Analyst Agent"
                  className="w-full bg-nova-bg border border-nova-surface-alt rounded-lg p-3 text-sm text-nova-text focus:outline-none focus:border-nova-primary transition-colors" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase text-nova-text-muted mb-1">LLM Model</label>
                <select 
                  name="model" 
                  defaultValue={editingAgent?.model || 'llama-3.3-70b-versatile'} 
                  className="w-full bg-nova-bg border border-nova-surface-alt rounded-lg p-3 text-sm text-nova-text focus:outline-none focus:border-nova-primary transition-colors"
                >
                  <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                  <option value="gpt-4o">gpt-4o</option>
                  <option value="claude-3-opus">claude-3-opus</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-xs font-bold uppercase text-nova-text-muted mb-1">System Prompt</label>
                <textarea 
                  name="prompt" 
                  defaultValue={editingAgent?.prompt || ''} 
                  required 
                  rows={6}
                  placeholder="You are an AI agent designed to..."
                  className="w-full bg-nova-bg border border-nova-surface-alt rounded-lg p-3 font-mono text-[13px] text-nova-info focus:outline-none focus:border-nova-primary transition-colors resize-none" 
                />
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-nova-text font-bold hover:bg-nova-surface-alt transition-colors">
                  Cancel
                </button>
                <button type="submit" className="bg-nova-primary hover:bg-nova-primary-dark text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm">
                  <Save className="w-4 h-4" />
                  {editingAgent ? "Save Changes" : "Deploy Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
