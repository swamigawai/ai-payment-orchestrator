import React, { useState, useCallback } from 'react';
import ReactFlow, { Background, Controls, Edge, Node, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';

const nodeStyle = {
    background: 'var(--color-surface-alt)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-surface)',
    borderRadius: '8px',
    padding: '15px',
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
    cursor: 'pointer',
    width: 200
};

const agentDetails: Record<string, any> = {
    '1': { name: 'Event Ingestor', model: 'llama-3.3-70b-versatile', role: 'Normalize payment_failed events into the shared state.' },
    '2': { name: 'Reason Classifier', model: 'llama-3.3-70b-versatile', role: 'Map raw error codes into business-level reasons.' },
    '3': { name: 'Recovery Channel Planner', model: 'llama-3.3-70b-versatile', role: 'Decide how and where to attempt recovery based on reason and country.' },
    '4': { name: 'Customer Agent', model: 'llama-3.3-70b-versatile', role: 'Draft a customer-facing message localized and friendly.' },
    '5': { name: 'Compliance Agent', model: 'llama-3.3-70b-versatile', role: 'Review and approve/block outgoing messages for safety.' },
    '6': { name: 'Final Output (Telegram)', model: 'Webhook API', role: 'Send the approved message securely to the user via Telegram.' }
};

const initialNodes: Node[] = [
  { id: '1', position: { x: 250, y: 50 }, data: { label: 'Event Ingestor' }, style: nodeStyle },
  { id: '2', position: { x: 250, y: 150 }, data: { label: 'Reason Classifier' }, style: nodeStyle },
  { id: '3', position: { x: 250, y: 250 }, data: { label: 'Recovery Channel Planner' }, style: nodeStyle },
  { id: '4', position: { x: 250, y: 350 }, data: { label: 'Customer Agent' }, style: nodeStyle },
  { id: '5', position: { x: 250, y: 450 }, data: { label: 'Compliance Agent' }, style: nodeStyle },
  { id: '6', position: { x: 250, y: 550 }, data: { label: 'Final Output (Telegram)' }, style: { ...nodeStyle, border: '2px solid var(--color-success)', color: 'var(--color-success)' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'var(--color-text-muted)' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: 'var(--color-text-muted)' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: 'var(--color-text-muted)' } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: 'var(--color-primary)', strokeWidth: 2 } },
  { id: 'e5-6', source: '5', target: '6', label: 'APPROVED', labelStyle: { fill: 'var(--color-success)', fontWeight: 'bold' }, style: { stroke: 'var(--color-success)', strokeWidth: 2 } },
  { id: 'e5-4', source: '5', target: '4', label: 'REVISION REQUIRED', type: 'step', sourceHandle: 'left', targetHandle: 'left', labelStyle: { fill: 'var(--color-error)', fontWeight: 'bold' }, style: { stroke: 'var(--color-error)', strokeWidth: 2, strokeDasharray: '5,5' } },
];

export default function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setActiveNodeId(node.id);
    setNodes((nds) => nds.map((n) => ({
      ...n,
      style: {
        ...n.style,
        border: n.id === node.id ? '2px solid var(--color-primary)' : (n.id === '6' ? '2px solid var(--color-success)' : '1px solid var(--color-surface)'),
        background: n.id === node.id ? 'var(--color-surface)' : 'var(--color-surface-alt)'
      }
    })));
  }, [setNodes]);

  return (
    <div className="flex h-full w-full gap-6">
      <div className="flex-1 bg-nova-surface border border-nova-surface-alt rounded-xl overflow-hidden shadow-sm relative">
        <div className="absolute top-4 left-4 z-10 bg-nova-surface/80 p-4 rounded-lg border border-nova-surface-alt shadow-sm backdrop-blur-md">
          <h2 className="text-nova-text font-bold text-lg">Playbook: Payment Recovery</h2>
          <p className="text-nova-text-muted text-sm">Visual representation of the LangGraph execution flow. Click a node for details.</p>
        </div>
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView 
          className="bg-nova-bg"
        >
          <Background variant="dots" color="var(--color-text-muted)" gap={24} size={1.5} style={{ opacity: 0.3 }} />
          <Controls className="bg-nova-surface-alt border-none fill-nova-text" />
        </ReactFlow>
      </div>

      {activeNodeId && agentDetails[activeNodeId] && (
        <div className="w-80 bg-nova-surface border border-nova-surface-alt shadow-lg rounded-xl p-6 flex flex-col h-max transition-all">
          <h3 className="text-nova-text font-bold text-xl mb-1">{agentDetails[activeNodeId].name}</h3>
          <span className="text-xs font-mono text-nova-primary font-bold mb-4 bg-nova-primary/10 px-2 py-1 rounded-md w-max border border-nova-primary/30">Model: {agentDetails[activeNodeId].model}</span>
          
          <div className="mb-4">
            <h4 className="text-nova-text-muted font-bold uppercase text-[10px] mb-1">Configuration</h4>
            <p className="text-nova-text text-sm leading-relaxed">{agentDetails[activeNodeId].role}</p>
          </div>
          
          <button className="mt-4 w-full bg-nova-surface-alt hover:bg-nova-primary/10 text-nova-primary font-bold text-sm py-2 rounded border border-nova-primary/20 transition-colors">
            Edit Node Config
          </button>
        </div>
      )}
    </div>
  );
}
