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

import { CustomNode, CustomEdge, BaseNodeData, VideoNodeData } from '../../types/nodes';
import Sidebar from './controls/Sidebar';
import BaseNode from './nodes/BaseNode';
import VideoNode from './nodes/VideoNode';

const nodeTypes = {
  base: BaseNode,
  video: VideoNode,
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
        type: type === 'video' ? 'video' : 'base',
        position,
        data: type === 'video' 
          ? { ...baseData, videoUrl: '', customButtons: [] } 
          : baseData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

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
          onDragOver={onDragOver}
          onDrop={onDrop}
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
