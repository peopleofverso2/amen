import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  TextField,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { MediaFile, MediaFilter } from '../../types/media';
import { MediaLibraryService } from '../../services/MediaLibraryService';
import MediaCard from './MediaCard';
import UploadDialog from './UploadDialog';

const mediaLibrary = new MediaLibraryService();

export default function MediaLibrary() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [filter, setFilter] = useState<MediaFilter>({});
  const [search, setSearch] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Charger les médias et les tags disponibles
  useEffect(() => {
    loadMedia();
    loadTags();
  }, [filter]);

  const loadMedia = async () => {
    try {
      const mediaFiles = await mediaLibrary.listMedia({
        ...filter,
        search,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      setMedia(mediaFiles);
    } catch (error) {
      console.error('Erreur lors du chargement des médias:', error);
    }
  };

  const loadTags = async () => {
    try {
      const allMedia = await mediaLibrary.listMedia();
      const tags = new Set<string>();
      allMedia.forEach(m => m.metadata.tags.forEach(tag => tags.add(tag)));
      setAvailableTags(Array.from(tags));
    } catch (error) {
      console.error('Erreur lors du chargement des tags:', error);
    }
  };

  const handleUpload = async (file: File, tags: string[]) => {
    try {
      await mediaLibrary.uploadMedia(file, { tags });
      loadMedia();
      loadTags();
      setUploadOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce média ?')) {
      try {
        await mediaLibrary.deleteMedia(id);
        loadMedia();
        loadTags();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleTagUpdate = async (mediaFile: MediaFile, newTags: string[]) => {
    try {
      await mediaLibrary.updateMetadata(mediaFile.metadata.id, {
        tags: newTags,
      });
      loadMedia();
      loadTags();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des tags:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Barre d'outils */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              multiple
              options={availableTags}
              value={selectedTags}
              onChange={(_, newValue) => setSelectedTags(newValue)}
              renderInput={(params) => (
                <TextField {...params} placeholder="Filtrer par tags" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    color="primary"
                    variant="outlined"
                  />
                ))
              }
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => setUploadOpen(true)}
            >
              Upload
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Grille de médias */}
      <Grid container spacing={2}>
        {media.map((mediaFile) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={mediaFile.metadata.id}>
            <MediaCard
              mediaFile={mediaFile}
              availableTags={availableTags}
              onDelete={() => handleDelete(mediaFile.metadata.id)}
              onTagsUpdate={(newTags) => handleTagUpdate(mediaFile, newTags)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Dialog d'upload */}
      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUpload}
        availableTags={availableTags}
      />
    </Box>
  );
}
