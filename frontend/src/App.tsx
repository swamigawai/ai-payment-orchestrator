import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { Users, LayoutDashboard, Workflow } from 'lucide-react';
import MonitorPage from './pages/MonitorPage';
import WorkflowBuilder from './pages/WorkflowBuilder';
import AgentsPage from './pages/AgentsPage';

function Sidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 border-r border-nova-surface-alt bg-nova-surface shadow-sm h-full flex flex-col pt-8 z-20">
      <div className="px-6 mb-8">
        <h1 className="text-nova-text font-bold tracking-widest text-lg">AI ORCHESTRATOR</h1>
        <p className="text-nova-text-muted text-xs mt-1 uppercase tracking-widest">Payment Recovery</p>
      </div>
      
      <nav className="flex-1 px-4 flex flex-col gap-2">
        <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/') ? 'bg-nova-primary/10 text-nova-primary border border-nova-primary/30' : 'text-nova-text-muted hover:text-nova-text hover:bg-nova-surface-alt'}`}>
          <LayoutDashboard className="w-5 h-5" />
          Monitor
        </Link>
        <Link to="/agents" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/agents') ? 'bg-nova-primary/10 text-nova-primary border border-nova-primary/30' : 'text-nova-text-muted hover:text-nova-text hover:bg-nova-surface-alt'}`}>
          <Users className="w-5 h-5" />
          Agents
        </Link>
        <Link to="/builder" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/builder') ? 'bg-nova-primary/10 text-nova-primary border border-nova-primary/30' : 'text-nova-text-muted hover:text-nova-text hover:bg-nova-surface-alt'}`}>
          <Workflow className="w-5 h-5" />
          Workflow Builder
        </Link>
      </nav>
      
      <div className="p-6 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-nova-success rounded-full animate-pulse shadow-[0_0_10px_var(--color-success)]" />
          <span className="text-nova-text-muted text-sm font-mono">System Online</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative h-screen w-screen bg-nova-bg font-sans overflow-hidden flex">
        {/* Persistent Background Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
          <BackgroundRippleEffect />
        </div>
        
        {/* Navigation Sidebar */}
        <div className="relative z-10 h-full">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 flex-1 h-full p-6 overflow-auto text-nova-text">
          <Routes>
            <Route path="/" element={<MonitorPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/builder" element={<WorkflowBuilder />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
