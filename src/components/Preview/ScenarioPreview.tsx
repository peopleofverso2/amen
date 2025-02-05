import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { Node, Edge, ReactFlowProvider } from 'reactflow';
import { Box, IconButton, Fade } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VideoNode from '../Editor/nodes/VideoNode';
import ButtonNode from '../Editor/nodes/ButtonNode';

const nodeTypes = {
  videoNode: VideoNode,
  buttonNode: ButtonNode,
};

interface ScenarioPreviewProps {
  nodes: Node[];
  edges: Edge[];
  onClose: () => void;
}

const ScenarioPreview: React.FC<ScenarioPreviewProps> = ({ nodes, edges, onClose }) => {
  const [showControls, setShowControls] = useState(false);
  const [mouseTimer, setMouseTimer] = useState<NodeJS.Timeout | null>(null);

  // Gérer le mouvement de la souris
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    
    if (mouseTimer) {
      clearTimeout(mouseTimer);
    }
    
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 2000);
    
    setMouseTimer(timer);
  }, [mouseTimer]);

  // Gérer la touche Echap
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseTimer) {
        clearTimeout(mouseTimer);
      }
    };
  }, [onClose, handleMouseMove, mouseTimer]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'black',
        zIndex: 9999,
      }}
    >
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes.map(node => ({
            ...node,
            draggable: false,
            selectable: false,
            data: {
              ...node.data,
              isPlaybackMode: true,
            },
          }))}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          maxZoom={1}
          minZoom={1}
          zoomOnScroll={false}
          panOnScroll={false}
          panOnDrag={false}
          preventScrolling={true}
          proOptions={{ hideAttribution: true }}
        />
      </ReactFlowProvider>

      <Fade in={showControls}>
        <IconButton
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </Fade>
    </Box>
  );
};

export default ScenarioPreview;
