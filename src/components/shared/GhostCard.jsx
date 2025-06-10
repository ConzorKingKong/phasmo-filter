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
      className={isSearchMatch ? 'ghost-pulse' : 'card-float'}
      sx={{ 
        height: '100%',
        position: 'relative',
        border: showBorder && isSearchMatch ? '3px solid #00ff41' : '1px solid rgba(138, 43, 226, 0.2)',
        boxShadow: showBorder && isSearchMatch ? 
          '0 0 30px rgba(0, 255, 65, 0.8), inset 0 0 20px rgba(0, 255, 65, 0.1)' : 
          '0 8px 32px rgba(138, 43, 226, 0.15)',
        background: isExcluded ? 
          'linear-gradient(135deg, rgba(255, 7, 58, 0.2) 0%, rgba(22, 33, 62, 0.9) 100%)' :
          isSearchMatch ?
          'linear-gradient(135deg, rgba(0, 255, 65, 0.1) 0%, rgba(22, 33, 62, 0.9) 50%, rgba(138, 43, 226, 0.1) 100%)' :
          'linear-gradient(135deg, rgba(22, 33, 62, 0.9) 0%, rgba(15, 52, 96, 0.8) 100%)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.5s ease',
        '&:hover': {
          transform: 'translateY(-5px) scale(1.02)',
          boxShadow: isSearchMatch ?
            '0 0 40px rgba(0, 255, 65, 1), inset 0 0 30px rgba(0, 255, 65, 0.2)' :
            '0 12px 40px rgba(138, 43, 226, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          border: isSearchMatch ? '3px solid #00ff41' : '1px solid rgba(138, 43, 226, 0.5)',
        }
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
          <Typography 
            variant="h6" 
            component="div" 
            className="ghost-text"
            sx={{ 
              flexGrow: 1,
              fontFamily: '"Butcherman", cursive',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 10px rgba(138, 43, 226, 0.5)',
              color: isExcluded ? '#ff073a' : isSearchMatch ? '#00ff41' : '#ffffff',
              fontSize: '1.4rem',
              letterSpacing: '1px',
              transition: 'all 0.3s ease'
            }}
          >
            👻 {ghost.ghost}
            {ghost.ghost === 'Banshee' && (
              <IconButton 
                onClick={playBansheeScream}
                size="small"
                sx={{ 
                  color: '#e94560',
                  ml: 1,
                  '&:hover': {
                    color: '#ff6b8a',
                    transform: 'scale(1.2)',
                    filter: 'drop-shadow(0 0 10px rgba(233, 69, 96, 0.8))'
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