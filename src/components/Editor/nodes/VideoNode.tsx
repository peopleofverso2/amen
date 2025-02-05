import { memo, useState, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  Box,
  IconButton
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ReactPlayer from 'react-player';
import { VideoNodeData } from '../../../types/nodes';
import MediaLibrary from '../../MediaLibrary/MediaLibrary';
import InteractionButtons from './InteractionButtons';
import { MediaFile } from '../../../types/media';

interface VideoNodeProps {
  data: VideoNodeData;
  isConnectable: boolean;
  onCreateInteraction?: (nodeId: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const VideoNode = memo(({ data, isConnectable, onCreateInteraction }: VideoNodeProps) => {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [videoUrl, setVideoUrl] = useState(data.videoUrl || '');
  const [showingInteractions, setShowingInteractions] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleVideoProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    const duration = playerRef.current?.getDuration() || 0;
    const timeLeft = duration - state.playedSeconds;
    
    // Afficher les interactions quand il reste 0.5 secondes ou moins
    if (timeLeft <= 0.5 && !showingInteractions) {
      setShowingInteractions(true);
    }
  };

  const handleVideoEnded = () => {
    setShowingInteractions(true);
  };

  const handleCreateInteraction = () => {
    if (onCreateInteraction) {
      onCreateInteraction(data.id);
    }
  };

  const handleMediaSelect = (selectedMedia: MediaFile[]) => {
    if (selectedMedia.length > 0) {
      // Utiliser la première vidéo sélectionnée
      const mediaFile = selectedMedia[0];
      data.videoUrl = mediaFile.url;
      data.label = mediaFile.metadata.name;
      handleClose();
    }
  };

  const handleSave = () => {
    // Mettre à jour le nœud avec la nouvelle URL vidéo
    data.videoUrl = videoUrl;
    if (!data.label || data.label === 'Nœud Vidéo') {
      // Si pas de label, utiliser la dernière partie de l'URL
      const urlParts = videoUrl.split('/');
      data.label = urlParts[urlParts.length - 1] || 'Vidéo YouTube';
    }
    handleClose();
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />

      <Card sx={{ width: 350, backgroundColor: '#2a2a2a' }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" color="white">
              {data.label || 'Nœud Vidéo'}
            </Typography>
            <IconButton 
              onClick={handleCreateInteraction}
              sx={{ color: 'white' }}
              title="Ajouter des interactions"
            >
              <AddIcon />
            </IconButton>
          </Stack>

          <Box sx={{ height: 200, mb: 2 }}>
            {data.videoUrl ? (
              <ReactPlayer
                ref={playerRef}
                url={data.videoUrl}
                width="100%"
                height="100%"
                controls
                onProgress={handleVideoProgress}
                onEnded={handleVideoEnded}
              />
            ) : (
              <Button 
                variant="outlined" 
                onClick={handleClickOpen}
                sx={{ width: '100%', height: '100%' }}
              >
                Sélectionner une vidéo
              </Button>
            )}
          </Box>

          <Box sx={{ position: 'relative', width: '100%', height: 100 }}>
            {showingInteractions && (
              <InteractionButtons
                buttons={data.interactionButtons || []}
                onChange={(newButtons) => {
                  data.interactionButtons = newButtons;
                }}
                containerWidth={350}
                containerHeight={100}
                isEditing={true}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />

      {/* Dialog de sélection de média */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Sélectionner une vidéo</DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="YouTube / URL" />
            <Tab label="Bibliothèque" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <TextField
              autoFocus
              margin="dense"
              label="URL de la vidéo"
              type="url"
              fullWidth
              variant="outlined"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              helperText="Collez l'URL YouTube ou une autre URL vidéo valide"
            />
            <DialogActions>
              <Button onClick={handleClose}>Annuler</Button>
              <Button onClick={handleSave} variant="contained">
                Sélectionner
              </Button>
            </DialogActions>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ height: '60vh' }}>
              <MediaLibrary
                onSelect={handleMediaSelect}
                multiSelect={false}
              />
            </Box>
          </TabPanel>
        </DialogContent>
      </Dialog>
    </>
  );
});

export default VideoNode;
