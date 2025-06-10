import React, { useState } from 'react';
import { Box, Grid, IconButton, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useApp } from '../../context/AppContext';
import { sortGhosts } from '../../utils/ghostUtils';
import { checkGhostFilters } from '../../utils/filterUtils';
import { huntEvidenceList } from '../../constants/huntEvidence';
import GhostCard from '../shared/GhostCard';

const GhostCards = () => {
  const { 
    ghosts, 
    selectedEvidence, 
    selectedSpeed,
    selectedHuntEvidence,
    setSelectedHuntEvidence,
    selectedSanity,
    searchQuery,
    setSearchQuery,
    excludedGhosts,
    setExcludedGhosts,
    sortOrder,
    setSortOrder
  } = useApp();

  const [expandedCards, setExpandedCards] = useState({});

  const toggleCard = (ghostName) => {
    setExpandedCards(prev => ({
      ...prev,
      [ghostName]: !prev[ghostName]
    }));
  };

  const handleTrashClick = (ghost) => {
    // Add ghost to excluded set
    setExcludedGhosts(prev => {
      const newExcluded = new Set(prev);
      newExcluded.add(ghost.ghost);
      return newExcluded;
    });
  };

  const handleRestoreClick = (ghost) => {
    // Remove ghost from excluded set and clear any hunt evidence that's false
    setExcludedGhosts(prev => {
      const newExcluded = new Set(prev);
      newExcluded.delete(ghost.ghost);
      return newExcluded;
    });

    // Clear hunt evidence that was set to false for this ghost
    setSelectedHuntEvidence(prev => {
      const newEvidence = { ...prev };
      huntEvidenceList.forEach(evidence => {
        if (evidence.ghost.split(', ').includes(ghost.ghost) && newEvidence[evidence.id] === false) {
          newEvidence[evidence.id] = undefined;
        }
      });
      return newEvidence;
    });
  };

  const filteredGhosts = sortGhosts(ghosts.filter(ghost => {
    // If there's a search query, show matching ghosts regardless of filters or exclusion
    if (searchQuery && ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase())) {
      return true;
    }

    // Don't show excluded ghosts for non-search results
    if (excludedGhosts.has(ghost.ghost)) {
      return false;
    }

    // Otherwise, only show ghosts that match all filters
    return checkGhostFilters(ghost, { selectedEvidence, selectedSpeed, selectedHuntEvidence, selectedSanity, huntEvidenceList });
  }), sortOrder).sort((a, b) => {
    // If there's a search query, prioritize matches
    if (searchQuery) {
      const aMatches = a.ghost.toLowerCase().includes(searchQuery.toLowerCase());
      const bMatches = b.ghost.toLowerCase().includes(searchQuery.toLowerCase());
      if (aMatches !== bMatches) {
        return aMatches ? -1 : 1;
      }
    }
    return 0;
  });

  // Check if all remaining ghosts are excluded
  if (filteredGhosts.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2, 
          mb: 2 
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search ghosts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setSearchQuery('')}
                    edge="end"
                    size="small"
                  >
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <FormControl sx={{ 
            minWidth: { xs: '100%', sm: 200 },
            width: { xs: '100%', sm: 'auto' }
          }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortOrder}
              label="Sort By"
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="fastest">Fastest → Slowest</MenuItem>
              <MenuItem value="slowest">Slowest → Fastest</MenuItem>
              <MenuItem value="sanity_highest">Sanity Highest → Lowest</MenuItem>
              <MenuItem value="sanity_lowest">Sanity Lowest → Highest</MenuItem>
              <MenuItem value="alphabetical">Alphabetical</MenuItem>
              <MenuItem value="alphabetical_reversed">Alphabetical Reversed</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No ghosts match your current filters
          </Typography>
          {excludedGhosts.size > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Manually Removed Ghosts
              </Typography>
              <Grid 
                container 
                spacing={2} 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(3, 1fr)'
                  },
                  gap: 2,
                  justifyContent: 'center'
                }}
              >
                {Array.from(excludedGhosts).map((ghostName) => {
                  const ghost = ghosts.find(g => g.ghost === ghostName);
                  if (!ghost) return null;
                  
                  return (
                    <Grid item key={ghost.ghost}>
                      <GhostCard
                        ghost={ghost}
                        isSearchMatch={false}
                        matchesFilters={true}
                        isExcluded={true}
                        onRestore={handleRestoreClick}
                        showBorder={false}
                        expandedCards={expandedCards}
                        onToggleCard={toggleCard}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2, 
        mb: 2 
      }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search ghosts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setSearchQuery('')}
                  edge="end"
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <FormControl sx={{ 
          minWidth: { xs: '100%', sm: 200 },
          width: { xs: '100%', sm: 'auto' }
        }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortOrder}
            label="Sort By"
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <MenuItem value="default">Default</MenuItem>
            <MenuItem value="fastest">Fastest → Slowest</MenuItem>
            <MenuItem value="slowest">Slowest → Fastest</MenuItem>
            <MenuItem value="sanity_highest">Sanity Highest → Lowest</MenuItem>
            <MenuItem value="sanity_lowest">Sanity Lowest → Highest</MenuItem>
            <MenuItem value="alphabetical">Alphabetical</MenuItem>
            <MenuItem value="alphabetical_reversed">Alphabetical Reversed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid 
        container 
        spacing={2} 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, 1fr)'
          },
          gap: 2
        }}
      >
        {filteredGhosts.map((ghost) => {
          const isSearchMatch = searchQuery && ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesFilters = checkGhostFilters(ghost, { selectedEvidence, selectedSpeed, selectedHuntEvidence, selectedSanity, huntEvidenceList });
          
          return (
            <Grid item key={ghost.ghost}>
              <GhostCard
                ghost={ghost}
                isSearchMatch={isSearchMatch}
                matchesFilters={matchesFilters}
                isExcluded={excludedGhosts.has(ghost.ghost)}
                onDelete={handleTrashClick}
                onRestore={handleRestoreClick}
                showBorder={true}
                expandedCards={expandedCards}
                onToggleCard={toggleCard}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default GhostCards;