import { useEffect, useMemo } from 'react';
import {
    ReactFlow, Background, Controls, useNodesState, useEdgesState, ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEditorStore } from '../store.js';
import { useShallow } from "zustand/react/shallow";
import dagre from 'dagre';
import DatasetNode from '../components/diagram/DatasetNode.jsx';

const nodeTypes = { dataset: DatasetNode };

const getLayoutedElements = (nodes, edges) => {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'LR', nodesep: 80, ranksep: 120 });

    nodes.forEach((node) => {
        g.setNode(node.id, { width: 280, height: 150 + (node.data.fields?.length || 0) * 24 });
    });

    edges.forEach((edge) => {
        g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = g.node(node.id);
        return {
            ...node,
            position: { x: nodeWithPosition.x - 140, y: nodeWithPosition.y - 75 },
        };
    });

    return { nodes: layoutedNodes, edges };
};

const DiagramViewInner = () => {
    const { datasets, relationships } = useEditorStore(useShallow((state) => ({
        datasets: state.getValue('semantic_model[0].datasets') || [],
        relationships: state.getValue('semantic_model[0].relationships') || [],
    })));

    const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
        const nodeList = datasets.map((dataset, index) => ({
            id: dataset.name || `dataset-${index}`,
            type: 'dataset',
            position: { x: 0, y: 0 },
            data: { name: dataset.name, source: dataset.source, fields: dataset.fields || [], index },
        }));

        const edgeList = relationships.map((rel, index) => ({
            id: `rel-${index}`,
            source: rel.from,
            target: rel.to,
            label: rel.name,
            style: { strokeWidth: 2, stroke: '#b1b1b7' },
            labelStyle: { fontSize: 10, fill: '#666' },
        }));

        return getLayoutedElements(nodeList, edgeList);
    }, [datasets, relationships]);

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    useEffect(() => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

    return (
        <div className="h-full w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.1}
                maxZoom={2}
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
};

const Diagram = () => (
    <ReactFlowProvider>
        <DiagramViewInner />
    </ReactFlowProvider>
);

export default Diagram;
