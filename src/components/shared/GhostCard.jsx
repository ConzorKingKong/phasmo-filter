import React, { useRef, useState } from 'react';
import { Box, Card, CardContent, Typography, Chip, Divider, IconButton, Collapse } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { getEvidenceLabel } from '../../utils/ghostUtils';

const GhostCard = ({ 
  ghost, 
  isSearchMatch = false, 
  matchesFilters = true, 
  isExcluded = false,
  onDelete,
  onRestore,
  showBorder = false,
  expandedCards = {},
  onToggleCard
}) => {
  const audioRef = useRef(new Audio('/sounds/banshee_scream.mp3'));

  const playBansheeScream = () => {
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  const handleToggleCard = () => {
    onToggleCard?.(ghost.ghost);
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        position: 'relative',
        border: showBorder && isSearchMatch ? '2px solid white' : 'none',
        boxShadow: showBorder && isSearchMatch ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none'
      }}
    >
      {/* Action Icons */}
      {!isExcluded && matchesFilters && onDelete ? (
        <IconButton
          onClick={() => onDelete(ghost)}
          sx={{ 
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'error.main',
            '&:hover': {
              color: 'error.dark'
            }
          }}
        >
          <DeleteIcon />
        </IconButton>
      ) : isSearchMatch && isExcluded && onRestore ? (
        <>
          <IconButton
            onClick={() => onRestore(ghost)}
            sx={{ 
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'success.main',
              '&:hover': {
                color: 'success.dark'
              }
            }}
          >
            <RestoreIcon />
          </IconButton>
          <CloseIcon 
            sx={{ 
              position: 'absolute',
              top: 14,
              right: 62,
              color: 'error.main',
              opacity: 0.7
            }} 
          />
        </>
      ) : isSearchMatch && !matchesFilters ? (
        <CloseIcon 
          sx={{ 
            position: 'absolute',
            top: 14,
            right: 14,
            color: 'error.main',
            opacity: 0.7
          }} 
        />
      ) : isExcluded && onRestore ? (
        <>
          <IconButton
            onClick={() => onRestore(ghost)}
            sx={{ 
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'success.main',
              '&:hover': {
                color: 'success.dark'
              }
            }}
          >
            <RestoreIcon />
          </IconButton>
          <CloseIcon 
            sx={{ 
              position: 'absolute',
              top: 14,
              right: 62,
              color: 'error.main',
              opacity: 0.7
            }} 
          />
        </>
      ) : null}

      {isSearchMatch && (
        <SearchIcon 
          sx={{ 
            position: 'absolute',
            top: 14,
            right: isExcluded ? 110 : 62,
            color: 'white',
            opacity: 0.7
          }} 
        />
      )}

      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {ghost.ghost}
            {ghost.ghost === 'Banshee' && (
              <IconButton 
                onClick={playBansheeScream}
                size="small"
                sx={{ 
                  color: 'white',
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                <VolumeUpIcon />
              </IconButton>
            )}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Evidence
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {ghost.evidence.map((evidence) => (
              <Chip
                key={evidence}
                label={getEvidenceLabel(evidence)}
                size="small"
                sx={{
                  ...(ghost.nightmare_evidence?.includes(evidence) && {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    }
                  })
                }}
              />
            ))}
            {/* Mimic special case - show Ghost Orbs */}
            {ghost.ghost === 'The Mimic' && !ghost.evidence.includes('Ghost Orbs') && (
              <Chip
                label={getEvidenceLabel('Ghost Orbs')}
                size="small"
                sx={{
                  backgroundColor: 'secondary.main',
                  color: 'white'
                }}
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2">Sanity Hunt Threshold</Typography>
          <Typography variant="body2">
            {ghost.hunt_sanity_low === ghost.hunt_sanity_high
              ? ghost.hunt_sanity || '-'
              : `${ghost.hunt_sanity_low || '-'} / ${ghost.hunt_sanity || '-'} / ${ghost.hunt_sanity_high || '-'}`}
          </Typography>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2">Movement Speed</Typography>
          <Typography variant="body2">
            {ghost.min_speed && ghost.max_speed && ghost.min_speed !== ghost.max_speed
              ? `${ghost.min_speed} m/s - ${ghost.max_speed} m/s`
              : ghost.min_speed
                ? `${ghost.min_speed} m/s`
                : '-'}
            {ghost.alt_speed && ` (${ghost.alt_speed} m/s Max Speed)`}
            {ghost.has_los && ' (Speeds up when line of sight)'}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ mb: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            cursor: 'pointer'
          }} onClick={handleToggleCard}>
            <Typography variant="subtitle2">Extra Info</Typography>
            <IconButton size="small">
              {expandedCards[ghost.ghost] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={expandedCards[ghost.ghost]}>
            {ghost.extra_information?.map((info, i) => (
              <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>
                • {info}
              </Typography>
            ))}
          </Collapse>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GhostCard;