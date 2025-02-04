import { Paper, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import VideocamIcon from '@mui/icons-material/Videocam';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import QrCodeIcon from '@mui/icons-material/QrCode';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const nodeTypes = [
  { type: 'text', icon: TextFieldsIcon, label: 'Texte' },
  { type: 'video', icon: VideocamIcon, label: 'Vidéo' },
  { type: 'interaction', icon: TouchAppIcon, label: 'Interaction' },
  { type: 'voucher', icon: QrCodeIcon, label: 'QR Code' },
  { type: 'reward', icon: EmojiEventsIcon, label: 'Récompense' }
];

const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        width: 240, 
        height: '100%',
        backgroundColor: '#2a2a2a',
        borderRight: '1px solid #404040'
      }}
    >
      <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #404040' }}>
        Éléments disponibles
      </Typography>
      <List>
        {nodeTypes.map(({ type, icon: Icon, label }) => (
          <ListItem
            key={type}
            draggable
            onDragStart={(event) => onDragStart(event, type)}
            sx={{
              cursor: 'grab',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
              },
            }}
          >
            <ListItemIcon>
              <Icon sx={{ color: '#1976d2' }} />
            </ListItemIcon>
            <ListItemText primary={label} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Sidebar;
