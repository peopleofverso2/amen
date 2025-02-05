import { useState, useEffect, useCallback } from 'react';
import { Dialog, Box, Button } from '@mui/material';
import ReactPlayer from 'react-player';
import { Node } from 'reactflow';
import { VideoNodeData } from '../../types/nodes';
import InteractionButtons from '../Editor/nodes/InteractionButtons';

interface FullscreenPlaylistProps {
  open: boolean;
  onClose: () => void;
  nodes: Node<VideoNodeData>[];
  onNodeSelect?: (nodeId: string) => void;
}

export default function FullscreenPlaylist({ open, onClose, nodes, onNodeSelect }: FullscreenPlaylistProps) {
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [mouseMoving, setMouseMoving] = useState(false);
  const [mouseTimer, setMouseTimer] = useState<NodeJS.Timeout | null>(null);

  // Filtrer uniquement les nœuds vidéo qui ont une URL
  const videoNodes = nodes.filter(node => 
    node.type === 'video' && 
    node.data?.videoUrl
  );

  const currentNode = videoNodes[currentNodeIndex];

  const handleVideoEnd = useCallback(() => {
    // Passer automatiquement au nœud suivant
    if (currentNodeIndex < videoNodes.length - 1) {
      setCurrentNodeIndex(prev => prev + 1);
    } else {
      // Revenir au début si c'était le dernier nœud
      setCurrentNodeIndex(0);
    }
  }, [currentNodeIndex, videoNodes.length]);

  const handleMouseMove = useCallback(() => {
    setMouseMoving(true);
    if (mouseTimer) {
      clearTimeout(mouseTimer);
    }
    const timer = setTimeout(() => {
      setMouseMoving(false);
    }, 2000);
    setMouseTimer(timer);
  }, [mouseTimer]);

  useEffect(() => {
    return () => {
      if (mouseTimer) {
        clearTimeout(mouseTimer);
      }
    };
  }, [mouseTimer]);

  // Réinitialiser l'index quand on ouvre la playlist
  useEffect(() => {
    if (open) {
      setCurrentNodeIndex(0);
    }
  }, [open]);

  if (!currentNode) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: 'black',
          position: 'relative',
        }}
        onMouseMove={handleMouseMove}
      >
        <ReactPlayer
          url={currentNode.data.videoUrl}
          width="100%"
          height="100%"
          controls={false}
          playing
          onEnded={handleVideoEnd}
        />
        
        {/* Bouton Echap */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            opacity: mouseMoving ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={onClose}
          >
            Echap
          </Button>
        </Box>

        {/* Indicateur de progression */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: mouseMoving ? 1 : 0,
            transition: 'opacity 0.3s',
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '8px 16px',
            borderRadius: '4px',
          }}
        >
          {currentNodeIndex + 1} / {videoNodes.length}
        </Box>
      </Box>
    </Dialog>
  );
}
