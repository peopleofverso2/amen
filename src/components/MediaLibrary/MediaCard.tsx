import { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Autocomplete,
  TextField,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayCircleOutline as PlayIcon,
} from '@mui/icons-material';
import { MediaFile } from '../../types/media';
import ReactPlayer from 'react-player';

interface MediaCardProps {
  mediaFile: MediaFile;
  availableTags: string[];
  onDelete: () => void;
  onTagsUpdate: (newTags: string[]) => void;
}

export default function MediaCard({
  mediaFile,
  availableTags,
  onDelete,
  onTagsUpdate,
}: MediaCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editTagsOpen, setEditTagsOpen] = useState(false);
  const [editedTags, setEditedTags] = useState(mediaFile.metadata.tags);

  const handleTagsSave = () => {
    onTagsUpdate(editedTags);
    setEditTagsOpen(false);
  };

  const isVideo = mediaFile.metadata.type === 'video';

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Aperçu du média */}
        <Box
          sx={{
            position: 'relative',
            paddingTop: '56.25%', // Ratio 16:9
            cursor: 'pointer',
          }}
          onClick={() => setPreviewOpen(true)}
        >
          {isVideo ? (
            <>
              <CardMedia
                component="img"
                image={mediaFile.url}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <PlayIcon
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 48,
                  color: 'white',
                }}
              />
            </>
          ) : (
            <CardMedia
              component="img"
              image={mediaFile.url}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            {mediaFile.metadata.name}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {mediaFile.metadata.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </CardContent>

        <CardActions>
          <IconButton size="small" onClick={() => setEditTagsOpen(true)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </Card>

      {/* Dialog de prévisualisation */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {isVideo ? (
            <ReactPlayer
              url={mediaFile.url}
              controls
              width="100%"
              height="auto"
              style={{ aspectRatio: '16/9' }}
            />
          ) : (
            <img
              src={mediaFile.url}
              style={{ width: '100%', height: 'auto' }}
              alt={mediaFile.metadata.name}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition des tags */}
      <Dialog
        open={editTagsOpen}
        onClose={() => setEditTagsOpen(false)}
      >
        <DialogTitle>Modifier les tags</DialogTitle>
        <DialogContent>
          <Autocomplete
            multiple
            freeSolo
            options={availableTags}
            value={editedTags}
            onChange={(_, newValue) => setEditedTags(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Ajouter des tags"
                fullWidth
                sx={{ mt: 2 }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTagsOpen(false)}>Annuler</Button>
          <Button onClick={handleTagsSave} variant="contained">
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
