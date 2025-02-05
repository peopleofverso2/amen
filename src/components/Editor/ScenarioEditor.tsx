import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
} from 'reactflow';
import { Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import 'reactflow/dist/style.css';

import { CustomNode, CustomEdge } from '../../types/nodes';
import { ProjectService } from '../../services/projectService';
import Sidebar from './controls/Sidebar';
import VideoNode from './nodes/VideoNode';
import ButtonNode from './nodes/ButtonNode';
import ScenarioPreview from '../Preview/ScenarioPreview';

const nodeTypes = {
  videoNode: VideoNode,
  buttonNode: ButtonNode,
};

let id = 0;
const getId = () => `node_${id++}`;

interface ScenarioEditorProps {
  projectId: string;
  onBackToLibrary: () => void;
}

const Flow: React.FC<ScenarioEditorProps> = ({ projectId, onBackToLibrary }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge[]>([]);
  const [isPlaybackMode, setIsPlaybackMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const projectService = ProjectService.getInstance();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onInit = useCallback((instance: any) => {
    setReactFlowInstance(instance);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNodeId = getId();

      let newNode;
      if (type === 'videoNode') {
        newNode = {
          id: newNodeId,
          type,
          position,
          data: {
            id: newNodeId,
            label: 'Nouvelle vidéo',
            videoUrl: '',
            buttons: [],
            isPlaybackMode,
            onDataChange: (data: any) => handleNodeDataChange(newNodeId, data),
          }
        };
      } else if (type === 'buttonNode') {
        newNode = {
          id: newNodeId,
          type,
          position,
          data: {
            id: newNodeId,
            label: 'Nouveau bouton',
            text: 'Cliquez ici',
            isPlaybackMode,
            onDataChange: (data: any) => handleNodeDataChange(newNodeId, data),
            onButtonClick: () => {
              if (newNode.data.targetNodeId) {
                const targetNode = nodes.find(n => n.id === newNode.data.targetNodeId);
                if (targetNode) {
                  reactFlowInstance.setCenter(
                    targetNode.position.x,
                    targetNode.position.y,
                    { duration: 800 }
                  );
                }
              }
            }
          }
        };
      }

      if (newNode) {
        setNodes((nds) => nds.concat(newNode));
      }
    },
    [reactFlowInstance, isPlaybackMode, nodes]
  );

  const handleNodeDataChange = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...newData,
                isPlaybackMode,
                onDataChange: (data: any) => handleNodeDataChange(nodeId, data),
                onButtonClick: node.data.onButtonClick
              },
            };
          }
          return node;
        })
      );
    },
    [isPlaybackMode]
  );

  useEffect(() => {
    const loadProjectData = async () => {
      if (projectId) {
        try {
          const project = await projectService.loadProject(projectId);
          if (project.nodes) {
            const nodesWithCallbacks = project.nodes.map((node: Node) => ({
              ...node,
              data: {
                ...node.data,
                isPlaybackMode,
                onDataChange: (data: any) => handleNodeDataChange(node.id, data),
                onButtonClick: node.type === 'buttonNode' ? () => {
                  if (node.data.targetNodeId) {
                    const targetNode = project.nodes.find((n: Node) => n.id === node.data.targetNodeId);
                    if (targetNode) {
                      reactFlowInstance?.setCenter(
                        targetNode.position.x,
                        targetNode.position.y,
                        { duration: 800 }
                      );
                    }
                  }
                } : undefined
              }
            }));
            setNodes(nodesWithCallbacks);
          }
          if (project.edges) {
            setEdges(project.edges);
          }
        } catch (error) {
          console.error('Error loading project:', error);
        }
      }
    };

    loadProjectData();
  }, [projectId, isPlaybackMode, reactFlowInstance]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await projectService.saveProject(projectId, {
        nodes,
        edges,
      });
    } catch (error) {
      console.error('Error saving project:', error);
    }
    setIsSaving(false);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar 
        position="static" 
        color="default" 
        elevation={1}
        sx={{
          bgcolor: isPlaybackMode ? 'success.main' : 'default',
          color: isPlaybackMode ? 'white' : 'inherit'
        }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onBackToLibrary}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            {isPlaybackMode ? 'Mode Lecture' : 'Éditeur de scénario'}
          </Typography>
          {isPlaybackMode && (
            <IconButton 
              color="inherit" 
              onClick={() => setIsPreviewMode(true)}
              sx={{ ml: 1 }}
            >
              <FullscreenIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {isPreviewMode && (
        <ScenarioPreview
          nodes={nodes}
          edges={edges}
          onClose={() => setIsPreviewMode(false)}
        />
      )}

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar 
          onSave={handleSave}
          onOpen={onBackToLibrary}
          isPlayMode={isPlaybackMode}
          onPlayModeToggle={() => setIsPlaybackMode(!isPlaybackMode)}
        />
        <Box 
          ref={reactFlowWrapper}
          sx={{ 
            flex: 1,
            height: 'calc(100vh - 64px)',
            '& .react-flow__panel': {
              zIndex: 5
            },
            '& .react-flow__minimap': {
              zIndex: 5
            },
            '& .react-flow__controls': {
              zIndex: 5
            },
            '& .react-flow__handle': {
              zIndex: 3,
              opacity: isPlaybackMode ? 0 : 1
            },
            '& .react-flow__node': {
              zIndex: 2
            },
            '& .react-flow__edge': {
              zIndex: 1
            },
            '& .react-flow__background': {
              zIndex: 0
            }
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={isPlaybackMode ? undefined : onNodesChange}
            onEdgesChange={isPlaybackMode ? undefined : onEdgesChange}
            onConnect={isPlaybackMode ? undefined : onConnect}
            onDragOver={isPlaybackMode ? undefined : onDragOver}
            onDrop={isPlaybackMode ? undefined : onDrop}
            onInit={onInit}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode={isPlaybackMode ? null : "Delete"}
            selectionKeyCode={isPlaybackMode ? null : "Shift"}
            multiSelectionKeyCode={isPlaybackMode ? null : "Control"}
            snapToGrid={!isPlaybackMode}
            snapGrid={[15, 15]}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true
            }}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={!isPlaybackMode}
            nodesConnectable={!isPlaybackMode}
            elementsSelectable={!isPlaybackMode}
          >
            <Background />
            <Controls 
              showInteractive={!isPlaybackMode}
              showZoom={true}
              showFitView={true}
            />
            <MiniMap />
          </ReactFlow>
        </Box>
      </Box>
    </Box>
  );
};

export default Flow;
