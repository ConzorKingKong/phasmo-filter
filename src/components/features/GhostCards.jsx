import React, { useState, useMemo, useCallback, useTransition } from 'react';
import { Box, Grid, IconButton, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { Virtuoso } from 'react-virtuoso';
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
  const [isPending, startTransition] = useTransition();
  
  // Local search state for immediate UI feedback
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Handle search input with transition
  const handleSearchChange = useCallback((event) => {
    const value = event.target.value;
    // Update local state immediately for responsive UI
    setLocalSearchQuery(value);
    
    // Defer the expensive filtering operation
    startTransition(() => {
      setSearchQuery(value);
    });
  }, [setSearchQuery, startTransition]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setLocalSearchQuery('');
    startTransition(() => {
      setSearchQuery('');
    });
  }, [setSearchQuery, startTransition]);

  const toggleCard = (ghostName) => {
    setExpandedCards(prev => ({
      ...prev,
      [ghostName]: !prev[ghostName]
    }));
  };

  const handleTrashClick = useCallback((ghost) => {
    // Add ghost to excluded set
    setExcludedGhosts(prev => {
      const newExcluded = new Set(prev);
      newExcluded.add(ghost.ghost);
      return newExcluded;
    });
  }, [setExcludedGhosts]);

  const handleRestoreClick = useCallback((ghost) => {
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
  }, [setExcludedGhosts, setSelectedHuntEvidence, huntEvidenceList]);


  // Memoize the search query processing
  const lowerSearchQuery = useMemo(() => 
    searchQuery ? searchQuery.toLowerCase() : null
  , [searchQuery]);

  // Memoize the filter object
  const filterParams = useMemo(() => ({
    selectedEvidence, 
    selectedSpeed, 
    selectedHuntEvidence, 
    selectedSanity, 
    huntEvidenceList
  }), [selectedEvidence, selectedSpeed, selectedHuntEvidence, selectedSanity, huntEvidenceList]);

  const filteredGhosts = useMemo(() => {
    return sortGhosts(ghosts.filter(ghost => {
      // If there's a search query, show matching ghosts regardless of filters or exclusion
      if (lowerSearchQuery && ghost.ghost.toLowerCase().includes(lowerSearchQuery)) {
        return true;
      }

      // Don't show excluded ghosts for non-search results
      if (excludedGhosts.has(ghost.ghost)) {
        return false;
      }

      // Otherwise, only show ghosts that match all filters
      return checkGhostFilters(ghost, filterParams);
    }), sortOrder).sort((a, b) => {
      // If there's a search query, prioritize matches
      if (lowerSearchQuery) {
        const aMatches = a.ghost.toLowerCase().includes(lowerSearchQuery);
        const bMatches = b.ghost.toLowerCase().includes(lowerSearchQuery);
        if (aMatches !== bMatches) {
          return aMatches ? -1 : 1;
        }
      }
      return 0;
    });
  }, [ghosts, lowerSearchQuery, excludedGhosts, filterParams, sortOrder]);

  // Calculate responsive columns
  const getColumnsPerRow = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 600) return 1;
      if (width < 900) return 2;
      if (width < 1200) return 3;
      return 4;
    }
    return 3;
  };

  const [columnsPerRow, setColumnsPerRow] = useState(() => getColumnsPerRow());

  // Handle window resize for responsive columns
  React.useEffect(() => {
    const handleResize = () => {
      setColumnsPerRow(getColumnsPerRow());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Group ghosts into rows for grid layout
  const ghostRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < filteredGhosts.length; i += columnsPerRow) {
      rows.push(filteredGhosts.slice(i, i + columnsPerRow));
    }
    return rows;
  }, [filteredGhosts, columnsPerRow]);

  // Grid row renderer for Virtuoso
  const ItemRenderer = useCallback((index) => {
    const ghostRow = ghostRows[index];
    
    if (!ghostRow || ghostRow.length === 0) {
      return <div style={{ height: '20px' }} />;
    }
    
    return (
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: columnsPerRow >= 2 ? 'repeat(2, 1fr)' : '1fr',
          md: columnsPerRow >= 3 ? 'repeat(3, 1fr)' : columnsPerRow >= 2 ? 'repeat(2, 1fr)' : '1fr',
          lg: `repeat(${columnsPerRow}, 1fr)`
        },
        gap: 2,
        px: 2,
        py: 1,
        minHeight: '450px'
      }}>
        {ghostRow.map((ghost) => (
          <GhostCard
            key={ghost.ghost}
            ghost={ghost}
            isSearchMatch={lowerSearchQuery && ghost.ghost.toLowerCase().includes(lowerSearchQuery)}
            matchesFilters={true}
            isExcluded={excludedGhosts.has(ghost.ghost)}
            onDelete={handleTrashClick}
            onRestore={handleRestoreClick}
            showBorder={true}
            expandedCards={expandedCards}
            onToggleCard={toggleCard}
          />
        ))}
      </Box>
    );
  }, [ghostRows, columnsPerRow, lowerSearchQuery, excludedGhosts, handleTrashClick, handleRestoreClick, expandedCards, toggleCard]);


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
              <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
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
          value={localSearchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ 
                  opacity: isPending ? 0.5 : 1,
                  transition: 'opacity 0.2s'
                }} />
              </InputAdornment>
            ),
            endAdornment: localSearchQuery && (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClearSearch}
                  edge="end"
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              opacity: isPending ? 0.8 : 1,
              transition: 'opacity 0.2s'
            }
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

      <Box sx={{ 
        height: 'calc(100vh - 200px)', // Stretch to bottom, accounting for header and search bar
        minHeight: '500px',
        width: '100%',
        opacity: isPending ? 0.7 : 1,
        transition: 'opacity 0.2s'
      }}>
        {ghostRows.length > 0 ? (
          <Virtuoso
            totalCount={ghostRows.length}
            itemContent={ItemRenderer}
            style={{ 
              height: '100%', 
              width: '100%' 
            }}
            overscan={2}
            defaultItemHeight={450}
            components={{
              EmptyPlaceholder: () => (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '200px',
                  width: '100%'
                }}>
                  <Typography variant="h6" color="text.secondary">
                    No ghosts match your current filters
                  </Typography>
                </Box>
              )
            }}
          />
        ) : (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px',
            width: '100%'
          }}>
            <Typography variant="h6" color="text.secondary">
              No ghosts match your current filters
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GhostCards;