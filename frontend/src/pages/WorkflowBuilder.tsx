import React from 'react';
import ReactFlow, { Background, Controls, Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';

const nodeStyle = {
    background: 'var(--color-surface-alt)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-surface)',
    borderRadius: '8px',
    padding: '15px',
    fontWeight: 'bold',
    fontFamily: 'sans-serif'
};

const selectedNodeStyle = {
    ...nodeStyle,
    border: '2px solid var(--color-primary)'
};

const initialNodes: Node[] = [
  { id: '1', position: { x: 250, y: 50 }, data: { label: 'Event Ingestor' }, style: nodeStyle },
  { id: '2', position: { x: 250, y: 150 }, data: { label: 'Reason Classifier' }, style: nodeStyle },
  { id: '3', position: { x: 250, y: 250 }, data: { label: 'Recovery Channel Planner' }, style: nodeStyle },
  { id: '4', position: { x: 250, y: 350 }, data: { label: 'Customer Agent' }, style: selectedNodeStyle }, // Highlighted
  { id: '5', position: { x: 250, y: 450 }, data: { label: 'Compliance Agent' }, style: nodeStyle },
  { id: '6', position: { x: 250, y: 550 }, data: { label: 'Final Output (Telegram)' }, style: { ...nodeStyle, border: '2px solid var(--color-success)', color: 'var(--color-success)' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'var(--color-text-muted)' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: 'var(--color-text-muted)' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: 'var(--color-text-muted)' } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: 'var(--color-primary)', strokeWidth: 2 } }, // Active highlight
  { id: 'e5-6', source: '5', target: '6', label: 'APPROVED', labelStyle: { fill: 'var(--color-success)', fontWeight: 'bold' }, style: { stroke: 'var(--color-success)', strokeWidth: 2 } },
  { id: 'e5-4', source: '5', target: '4', label: 'REVISION REQUIRED', type: 'step', sourceHandle: 'left', targetHandle: 'left', labelStyle: { fill: 'var(--color-error)', fontWeight: 'bold' }, style: { stroke: 'var(--color-error)', strokeWidth: 2, strokeDasharray: '5,5' } },
];

export default function WorkflowBuilder() {
  return (
    <div className="w-full h-full bg-nova-surface border border-nova-surface-alt rounded-xl overflow-hidden shadow-2xl relative">
      <div className="absolute top-4 left-4 z-10 bg-nova-surface-alt/80 p-4 rounded-lg border border-nova-surface-alt backdrop-blur-md">
        <h2 className="text-nova-text font-bold text-lg">Playbook: Payment Recovery</h2>
        <p className="text-nova-text-muted text-sm">Visual representation of the LangGraph execution flow.</p>
      </div>
      <ReactFlow 
        nodes={initialNodes} 
        edges={initialEdges} 
        fitView 
        className="bg-nova-bg"
      >
        <Background variant="dots" color="var(--color-text-muted)" gap={24} size={1.5} style={{ opacity: 0.3 }} />
        <Controls className="bg-nova-surface-alt border-none fill-nova-text" />
      </ReactFlow>
    </div>
  );
}
