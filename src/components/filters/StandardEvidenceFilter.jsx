import React from 'react';
import { Box, Typography, Checkbox, Collapse, IconButton } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { getEvidenceLabel, ghostCanHaveEvidence } from '../../utils/ghostUtils';
import { isEvidenceImpossible } from '../../utils/filterUtils';

const StandardEvidenceFilter = ({
  selectedEvidence,
  onEvidenceClick,
  onEvidenceExclude,
  searchQuery,
  ghosts,
  selectedSpeed,
  selectedHuntEvidence,
  selectedSanity,
  huntEvidenceList,
  expanded,
  onToggleExpanded
}) => {
  const evidenceTypes = [
    'EMF 5',
    'Spirit Box',
    'Ultraviolet',
    'Ghost Orbs',
    'Writing',
    'Freezing',
    'DOTs'
  ];

  const isEvidenceInSearchResults = (evidence) => {
    if (!searchQuery) return false;
    return ghosts.some(ghost => 
      ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase().trim()) && 
      ghostCanHaveEvidence(ghost, evidence)
    );
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer' }} onClick={onToggleExpanded}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Standard Evidence
        </Typography>
        <IconButton>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {evidenceTypes
            .slice()
            .sort((a, b) => {
              // First sort by impossible status
              const aImpossible = isEvidenceImpossible(a, { selectedEvidence, selectedSpeed, selectedHuntEvidence, selectedSanity, huntEvidenceList }, ghosts);
              const bImpossible = isEvidenceImpossible(b, { selectedEvidence, selectedSpeed, selectedHuntEvidence, selectedSanity, huntEvidenceList }, ghosts);
              if (aImpossible !== bImpossible) {
                return aImpossible ? 1 : -1;
              }

              // Then sort by evidence state (neutral first)
              const aState = selectedEvidence[a];
              const bState = selectedEvidence[b];
              if (aState !== bState) {
                // If either is undefined (neutral), it goes first
                if (aState === undefined) return -1;
                if (bState === undefined) return 1;
                // Otherwise maintain relative order
                return 0;
              }

              // Then sort by search match
              const aMatchesSearch = searchQuery && 
                ghosts.some(ghost => 
                  ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase().trim()) && 
                  ghost.evidence.includes(a)
                );
              const bMatchesSearch = searchQuery && 
                ghosts.some(ghost => 
                  ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase().trim()) && 
                  ghost.evidence.includes(b)
                );
              if (aMatchesSearch !== bMatchesSearch) {
                return aMatchesSearch ? -1 : 1;
              }

              // Finally sort by original order
              return 0;
            })
            .map((evidence) => {
              const isImpossible = isEvidenceImpossible(evidence, { selectedEvidence, selectedSpeed, selectedHuntEvidence, selectedSanity, huntEvidenceList }, ghosts);
              const isExcluded = selectedEvidence[evidence] === false;
              const isIncluded = selectedEvidence[evidence] === true;
              return (
                <Box
                  key={evidence}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 0.5,
                    borderRadius: 1,
                    bgcolor: isExcluded ? 'error.dark' : isIncluded ? 'success.dark' : 'transparent',
                    '&:hover': {
                      bgcolor: isExcluded ? 'error.dark' : isIncluded ? 'success.dark' : 'action.hover',
                    },
                    cursor: 'pointer',
                    opacity: isImpossible ? 0.5 : 1,
                  }}
                  onClick={() => onEvidenceClick(evidence)}
                >
                  <Checkbox
                    checked={isIncluded}
                    sx={{
                      color: isImpossible ? 'text.disabled' : 'text.secondary',
                      '&.Mui-checked': {
                        color: isImpossible ? 'text.disabled' : 'success.main',
                      },
                    }}
                  />
                  <Box sx={{ 
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    color: isImpossible ? 'text.disabled' :
                           isExcluded ? 'error.main' :
                           isIncluded ? 'success.main' :
                           'text.primary'
                  }}>
                    {getEvidenceLabel(evidence)}
                    {isEvidenceInSearchResults(evidence) && (
                      <FilterAltIcon 
                        sx={{ 
                          ml: 1, 
                          fontSize: '1rem',
                          color: 'primary.main',
                          opacity: 0.7
                        }} 
                      />
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => onEvidenceExclude(evidence, e)}
                    sx={{
                      color: isExcluded ? 'error.main' : 'text.secondary',
                      '&:hover': {
                        color: 'error.main',
                      },
                      opacity: isImpossible ? 0.5 : 1,
                    }}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </Box>
              );
            })}
        </Box>
      </Collapse>
    </>
  );
};

export default StandardEvidenceFilter;