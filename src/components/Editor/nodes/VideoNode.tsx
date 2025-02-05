import React from 'react';
import { NodeProps } from 'reactflow';
import { Box, IconButton, Typography, Stack } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { VideoNodeData } from '../../../types/nodes';
import BaseNode from './BaseNode';
import AddIcon from '@mui/icons-material/Add';

interface VideoPlayerProps {
  url: string;
  isPlaybackMode?: boolean;
  buttons?: Array<{
    id: string;
    label: string;
    buttonText: string;
    targetNodeId?: string;
  }>;
  showButtons?: boolean;
  onVideoClick?: () => void;
  onButtonClick?: (targetNodeId: string) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  isPlaybackMode,
  buttons,
  showButtons,
  onVideoClick,
  onButtonClick,
}) => (
  <Box sx={{ position: 'relative', width: '100%', minHeight: '200px' }}>
    <video
      src={url}
      controls={isPlaybackMode}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '4px',
      }}
      onClick={onVideoClick}
    />
    {showButtons && buttons && (
      <Stack direction="row" spacing={1} sx={{ position: 'absolute', bottom: 0, left: 0 }}>
        {buttons.map(button => (
          <IconButton key={button.id} onClick={() => onButtonClick?.(button.targetNodeId || '')}>
            {button.buttonText}
          </IconButton>
        ))}
      </Stack>
    )}
  </Box>
);

const EmptyVideoState: React.FC<{ onImportClick?: () => void }> = ({ onImportClick }) => (
  <Box
    sx={{
      width: '100%',
      height: '200px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'rgba(0, 0, 0, 0.05)',
      borderRadius: '4px',
      cursor: 'pointer',
    }}
    onClick={onImportClick}
  >
    <IconButton>
      <PlayCircleOutlineIcon />
    </IconButton>
  </Box>
);

const VideoNode: React.FC<NodeProps<VideoNodeData>> = ({ data, id, isConnectable, onCreateInteraction }) => {
  const { videoUrl, label, isPlaybackMode, buttons, onDataChange, onNavigate } = data;

  const handleDataChange = (updates: any) => {
    if (onDataChange) {
      onDataChange({ ...updates, id });
    }
  };

  const handleCreateInteraction = () => {
    if (onCreateInteraction) {
      onCreateInteraction(id);
    }
  };

  return (
    <BaseNode
      label={label}
      isPlaybackMode={isPlaybackMode}
      onLabelChange={isPlaybackMode ? undefined : (newLabel) => handleDataChange({ label: newLabel })}
    >
      <Box sx={{ 
        width: '100%',
        minWidth: 320,
        position: 'relative',
        '& .MuiIconButton-root': {
          opacity: isPlaybackMode ? 0 : 1,
          pointerEvents: isPlaybackMode ? 'none' : 'auto'
        }
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'white' }}>
            {label}
          </Typography>
          {!isPlaybackMode && (
            <Stack direction="row" spacing={1}>
              <IconButton 
                className="add-interaction"
                onClick={handleCreateInteraction}
                sx={{ 
                  color: 'white',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  pointerEvents: isPlaybackMode ? 'none' : 'auto'
                }}
                title="Ajouter des interactions"
              >
                <AddIcon />
              </IconButton>
            </Stack>
          )}
        </Box>
        {videoUrl ? (
          <VideoPlayer
            url={videoUrl}
            isPlaybackMode={isPlaybackMode}
            buttons={buttons}
            showButtons={true}
            onVideoClick={!isPlaybackMode ? () => {
              // Ouvrir la boîte de dialogue d'édition
            } : undefined}
            onButtonClick={onNavigate}
          />
        ) : (
          !isPlaybackMode && (
            <EmptyVideoState
              onImportClick={() => {
                // TODO: Implémenter l'import de vidéo
                console.log('Import video clicked');
              }}
            />
          )
        )}
      </Box>
    </BaseNode>
  );
};

export default VideoNode;
