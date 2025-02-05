import React from 'react';
import { Handle, Position } from 'reactflow';
import { Box, Typography, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

interface BaseNodeProps {
  children: React.ReactNode;
  label: string;
  isPlaybackMode?: boolean;
  onLabelChange?: (newLabel: string) => void;
}

const BaseNode: React.FC<BaseNodeProps> = ({
  children,
  label,
  isPlaybackMode,
  onLabelChange,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedLabel, setEditedLabel] = React.useState(label);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleLabelClick = () => {
    if (!isPlaybackMode && onLabelChange) {
      setIsEditing(true);
    }
  };

  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedLabel(event.target.value);
  };

  const handleLabelBlur = () => {
    setIsEditing(false);
    if (onLabelChange && editedLabel.trim() !== '') {
      onLabelChange(editedLabel);
    } else {
      setEditedLabel(label);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLabelBlur();
    }
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 3,
        p: 2,
        minWidth: 200,
      }}
    >
      <Handle type="target" position={Position.Top} />
      
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        {isEditing ? (
          <input
            ref={inputRef}
            value={editedLabel}
            onChange={handleLabelChange}
            onBlur={handleLabelBlur}
            onKeyPress={handleKeyPress}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        ) : (
          <>
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                cursor: isPlaybackMode ? 'default' : 'pointer',
              }}
              onClick={handleLabelClick}
            >
              {label}
            </Typography>
            {!isPlaybackMode && onLabelChange && (
              <IconButton
                size="small"
                onClick={() => setIsEditing(true)}
                sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </>
        )}
      </Box>

      {children}

      <Handle type="source" position={Position.Bottom} />
    </Box>
  );
};

export default BaseNode;
