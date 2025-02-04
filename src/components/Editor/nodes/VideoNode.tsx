import { memo, useState } from 'react';
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
  Box
} from '@mui/material';
import ReactPlayer from 'react-player';
import { VideoNodeData } from '../../../types/nodes';
import MediaLibrary from '../../MediaLibrary/MediaLibrary';
import InteractionButtons from './InteractionButtons';

interface VideoNodeProps {
  data: VideoNodeData;
  isConnectable: boolean;
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

const VideoNode = ({ data, isConnectable }: VideoNodeProps) => {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [videoUrl, setVideoUrl] = useState(data.videoUrl || '');
  const [localFile, setLocalFile] = useState<File | null>(null);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMediaSelect = (url: string) => {
    setVideoUrl(url);
    handleClose();
  };

  const handleSave = () => {
    // Mettre à jour le nœud avec la nouvelle URL vidéo
    data.videoUrl = videoUrl;
    handleClose();
  };

  return (
    <>
      <Card sx={{ width: 350, backgroundColor: '#2a2a2a' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {data.label || 'Nœud Vidéo'}
          </Typography>

          <Box sx={{ height: 200, mb: 2 }}>
            {videoUrl ? (
              <ReactPlayer
                url={videoUrl}
                width="100%"
                height="100%"
                controls
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
            <InteractionButtons
              buttons={data.interactionButtons || []}
              onChange={(newButtons) => {
                data.interactionButtons = newButtons;
              }}
              containerWidth={350}
              containerHeight={100}
              isEditing={true}
            />
          </Box>

          <Stack spacing={1}>
            {data.choices.map((choice, index) => (
              <Button
                key={index}
                variant="outlined"
                size="small"
                sx={{ justifyContent: 'flex-start' }}
              >
                {choice.text}
              </Button>
            ))}
          </Stack>
        </CardContent>

        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
        />
        {[Position.Bottom, Position.Right, Position.Left].map((position, index) => (
          <Handle
            key={position}
            type="source"
            position={position}
            id={`choice-${index}`}
            isConnectable={isConnectable}
          />
        ))}
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
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
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ height: '60vh' }}>
              <MediaLibrary />
            </Box>
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSave} variant="contained">
            Sélectionner
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default memo(VideoNode);
