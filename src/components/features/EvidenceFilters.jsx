import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Button, Divider } from '@mui/material';
import { useApp } from '../../context/AppContext';
import { huntEvidenceList } from '../../constants/huntEvidence';
import SmudgeTimer from '../timers/SmudgeTimer';
import HuntCooldownTimer from '../timers/HuntCooldownTimer';
import StandardEvidenceFilter from '../filters/StandardEvidenceFilter';
import SpeedFilter from '../filters/SpeedFilter';
import HuntSanityFilter from '../filters/HuntSanityFilter';
import UniqueEvidenceFilter from '../filters/UniqueEvidenceFilter';

const EvidenceFilters = () => {
  const { 
    selectedEvidence, 
    setSelectedEvidence, 
    selectedSpeed,
    setSelectedSpeed,
    selectedHuntEvidence,
    setSelectedHuntEvidence,
    selectedSanity,
    setSelectedSanity,
    searchQuery,
    setSearchQuery,
    setExcludedGhosts,
    ghosts,
    sortOrder,
    setSortOrder,
    setSmudgeTimer,
    setHuntCooldownTimer,
    timerWorker
  } = useApp();

  const [activeTab, setActiveTab] = useState(0);
  const [evidenceExpanded, setEvidenceExpanded] = useState(false);
  const [speedExpanded, setSpeedExpanded] = useState(false);
  const [sanityExpanded, setSanityExpanded] = useState(false);
  const [huntEvidenceExpanded, setHuntEvidenceExpanded] = useState(true);

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  const handleEvidenceClick = (evidence) => {
    setSelectedEvidence(prev => {
      const currentState = prev[evidence];
      const newState = currentState === undefined ? true : undefined;
      return { ...prev, [evidence]: newState };
    });
  };

  const handleEvidenceExclude = (evidence, e) => {
    e.stopPropagation();
    setSelectedEvidence(prev => {
      const currentState = prev[evidence];
      const newState = currentState === undefined ? false : undefined;
      return { ...prev, [evidence]: newState };
    });
  };

  const handleSpeedClick = (speedType) => {
    setSelectedSpeed(prev => {
      const currentState = prev[speedType];
      const newState = currentState === undefined ? true : undefined;
      return { ...prev, [speedType]: newState };
    });
  };

  const handleSpeedExclude = (speedType, e) => {
    e.stopPropagation();
    setSelectedSpeed(prev => {
      const currentState = prev[speedType];
      const newState = currentState === undefined ? false : undefined;
      return { ...prev, [speedType]: newState };
    });
  };

  const handleHuntEvidenceClick = (evidence) => {
    setSelectedHuntEvidence(prev => {
      const currentState = prev[evidence];
      let newState;
      if (currentState === undefined) {
        newState = true;
      } else if (currentState === true) {
        newState = undefined;
      } else if (currentState === false) {
        newState = undefined;
        
        const huntEvidence = huntEvidenceList.find(e => e.id === evidence);
        if (huntEvidence) {
          const affectedGhosts = huntEvidence.ghost.split(', ');
          setExcludedGhosts(prevExcluded => {
            const newExcluded = new Set(prevExcluded);
            
            affectedGhosts.forEach(ghostName => {
              if (newExcluded.has(ghostName)) {
                const ghostEvidence = Object.entries(huntEvidenceList)
                  .filter(([_, evidenceData]) => evidenceData.ghost.split(', ').includes(ghostName))
                  .map(([evidenceId]) => evidenceId);
                
                const hasOtherExcludedEvidence = ghostEvidence.some(evidenceId => {
                  if (evidenceId === evidence) return false;
                  return prev[evidenceId] === false;
                });
                
                if (!hasOtherExcludedEvidence) {
                  newExcluded.delete(ghostName);
                }
              }
            });
            
            return newExcluded;
          });
        }
      }
      return { ...prev, [evidence]: newState };
    });
  };

  const handleHuntEvidenceExclude = (evidence, e) => {
    e.stopPropagation();
    setSelectedHuntEvidence(prev => {
      const currentState = prev[evidence];
      const newState = currentState === undefined ? false : undefined;
      return { ...prev, [evidence]: newState };
    });
  };

  const handleSanityClick = (sanityType) => {
    setSelectedSanity(prev => {
      const currentState = prev[sanityType];
      const newState = currentState === undefined ? true : undefined;
      return { ...prev, [sanityType]: newState };
    });
  };

  const handleSanityExclude = (sanityType, e) => {
    e.stopPropagation();
    setSelectedSanity(prev => {
      const currentState = prev[sanityType];
      const newState = currentState === undefined ? false : undefined;
      return { ...prev, [sanityType]: newState };
    });
  };


  const resetAllFilters = () => {
    const resetEvidence = Object.keys(selectedEvidence).reduce((acc, key) => {
      acc[key] = undefined;
      return acc;
    }, {});
    setSelectedEvidence(resetEvidence);

    const resetSpeed = Object.keys(selectedSpeed).reduce((acc, key) => {
      acc[key] = undefined;
      return acc;
    }, {});
    setSelectedSpeed(resetSpeed);

    const resetHuntEvidence = Object.keys(selectedHuntEvidence).reduce((acc, key) => {
      acc[key] = undefined;
      return acc;
    }, {});
    setSelectedHuntEvidence(resetHuntEvidence);

    const resetSanity = Object.keys(selectedSanity).reduce((acc, key) => {
      acc[key] = undefined;
      return acc;
    }, {});
    setSelectedSanity(resetSanity);

    setExcludedGhosts(new Set());
    setSortOrder('default');
    setSearchQuery('');
    
    // Reset timers
    timerWorker.resetTimer('smudge', 180);
    timerWorker.resetTimer('huntCooldown', 25);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Filters" />
        <Tab label="Timers" />
        <Tab label="Extra Information" />
      </Tabs>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {activeTab === 0 ? (
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h5" 
                gutterBottom
                className="spooky-title"
                sx={{
                  fontFamily: '"Creepster", cursive',
                  textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9), 0 0 25px rgba(220, 20, 60, 0.8)',
                  color: '#dc143c',
                  letterSpacing: '2px',
                  textAlign: 'center',
                  mb: 2
                }}
              >
                🔮 Spectral Filters 🔮
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                onClick={resetAllFilters}
                className="spooky-button"
                sx={{
                  fontSize: '1.1rem',
                  px: 3,
                  py: 1.5,
                  border: '2px solid #e94560',
                  color: '#e94560',
                  display: 'block',
                  mx: 'auto',
                  '&:hover': {
                    border: '2px solid #ff6b8a',
                    color: '#ff6b8a',
                    background: 'rgba(233, 69, 96, 0.1)',
                    transform: 'translateY(-2px) scale(1.05)',
                  }
                }}
              >
                🔄 Reset All
              </Button>
            </Box>

            <StandardEvidenceFilter
              selectedEvidence={selectedEvidence}
              onEvidenceClick={handleEvidenceClick}
              onEvidenceExclude={handleEvidenceExclude}
              searchQuery={searchQuery}
              ghosts={ghosts}
              selectedSpeed={selectedSpeed}
              selectedHuntEvidence={selectedHuntEvidence}
              selectedSanity={selectedSanity}
              huntEvidenceList={huntEvidenceList}
              expanded={evidenceExpanded}
              onToggleExpanded={() => setEvidenceExpanded(!evidenceExpanded)}
            />

            <Divider sx={{ my: 2 }} />

            <SpeedFilter
              selectedSpeed={selectedSpeed}
              onSpeedClick={handleSpeedClick}
              onSpeedExclude={handleSpeedExclude}
              searchQuery={searchQuery}
              ghosts={ghosts}
              expanded={speedExpanded}
              onToggleExpanded={() => setSpeedExpanded(!speedExpanded)}
            />

            <Divider sx={{ my: 2 }} />

            <HuntSanityFilter
              selectedSanity={selectedSanity}
              onSanityClick={handleSanityClick}
              onSanityExclude={handleSanityExclude}
              searchQuery={searchQuery}
              ghosts={ghosts}
              expanded={sanityExpanded}
              onToggleExpanded={() => setSanityExpanded(!sanityExpanded)}
            />

            <Divider sx={{ my: 2 }} />

            <UniqueEvidenceFilter
              selectedHuntEvidence={selectedHuntEvidence}
              onHuntEvidenceClick={handleHuntEvidenceClick}
              onHuntEvidenceExclude={handleHuntEvidenceExclude}
              searchQuery={searchQuery}
              ghosts={ghosts}
              huntEvidenceList={huntEvidenceList}
              expanded={huntEvidenceExpanded}
              onToggleExpanded={() => setHuntEvidenceExpanded(!huntEvidenceExpanded)}
              sortOrder={sortOrder}
            />
          </Box>
        ) : activeTab === 1 ? (
          <Box sx={{ p: 2 }}>
            <SmudgeTimer />
            <HuntCooldownTimer />
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Movement Speeds
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Player Speeds:
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • Walking speed = 1.6 m/s
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • Running speed = 3 m/s for 3s, 5s cooldown
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                • Player speeds are not affected by crouching
              </Typography>

              <Typography variant="body1" sx={{ mb: 1 }}>
                Ghost Speeds:
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                • Default movement speed = 1.7 m/s
              </Typography>

              <Typography variant="body1" sx={{ mb: 1 }}>
                Speed Identification:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Since player walking speed is 1.6 m/s, identifying ghosts slower than the default 1.7 meters per second is easy, as you will walk faster than them while looping out of LOS (crouched)
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EvidenceFilters;