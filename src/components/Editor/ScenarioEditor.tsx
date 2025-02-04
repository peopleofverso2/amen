import { useState, useCallback, DragEvent } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
} from 'reactflow';
import { Box } from '@mui/material';
import 'reactflow/dist/style.css';

import { CustomNode, CustomEdge, BaseNodeData, VideoNodeData, InteractionNodeData } from '../../types/nodes';
import Sidebar from './controls/Sidebar';
import BaseNode from './nodes/BaseNode';
import VideoNode from './nodes/VideoNode';
import InteractionNode from './nodes/InteractionNode';

const nodeTypes = {
  base: BaseNode,
  video: VideoNode,
  interactionNode: InteractionNode,
};

let id = 0;
const getId = () => `node_${id++}`;

const ScenarioEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge[]>([]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - 240,
        y: event.clientY,
      };

      const baseData = {
        label: `Nouveau ${type}`,
        choices: [
          { text: 'Option 1', nextNodeId: '' },
          { text: 'Option 2', nextNodeId: '' },
          { text: 'Option 3', nextNodeId: '' },
        ],
      };

      const newNode: Node = {
        id: getId(),
        type: type === 'video' ? 'video' : type === 'interactionNode' ? 'interactionNode' : 'base',
        position,
        data: type === 'video' 
          ? { ...baseData, videoUrl: '', customButtons: [] } 
          : type === 'interactionNode'
            ? { label: 'Interactions', parentNodeId: '', buttons: [], timing: { showAtEnd: true } }
            : baseData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const handleCreateInteraction = useCallback((parentNodeId: string) => {
    // Trouver le nœud parent
    const parentNode = nodes.find(node => node.id === parentNodeId);
    if (!parentNode) return;

    // Créer le nœud d'interaction
    const interactionNode: Node<InteractionNodeData> = {
      id: getId(),
      type: 'interactionNode',
      position: {
        x: parentNode.position.x + 400,
        y: parentNode.position.y,
      },
      data: {
        label: 'Interactions',
        parentNodeId,
        buttons: [],
        timing: {
          showAtEnd: true,
        },
      },
    };

    // Ajouter le nœud
    setNodes((nds) => nds.concat(interactionNode));

    // Créer la connexion
    const edge: Edge = {
      id: getId(),
      source: parentNodeId,
      target: interactionNode.id,
      type: 'default',
    };

    setEdges((eds) => eds.concat(edge));
  }, [nodes, setNodes, setEdges]);

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </Box>
    </Box>
  );
};

export default ScenarioEditor;
