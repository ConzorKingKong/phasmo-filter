import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Checkbox, FormControlLabel, Divider, TextField, InputAdornment, IconButton, Tabs, Tab, Button, Collapse } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useApp } from '../../context/AppContext';

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
    setSortOrder
  } = useApp();

  const [activeTab, setActiveTab] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [isHuntCooldownPlaying, setIsHuntCooldownPlaying] = useState(false);
  const [huntCooldownTimeLeft, setHuntCooldownTimeLeft] = useState(25); // 25 seconds
  const [huntEvidenceSearch, setHuntEvidenceSearch] = useState('');
  const [evidenceExpanded, setEvidenceExpanded] = useState(false);
  const [speedExpanded, setSpeedExpanded] = useState(false);
  const [sanityExpanded, setSanityExpanded] = useState(false);
  const [huntEvidenceExpanded, setHuntEvidenceExpanded] = useState(true);

  // Timer refs
  const timerRef = useRef(null);
  const huntCooldownTimerRef = useRef(null);
  const startTimeRef = useRef(null);
  const huntCooldownStartTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const huntCooldownAnimationFrameRef = useRef(null);
  const elapsedTimeRef = useRef(0); // Track accumulated elapsed time for pause/resume
  const huntCooldownElapsedTimeRef = useRef(0); // Track accumulated elapsed time for hunt cooldown pause/resume
  const startSoundRef = useRef(new Audio('/sounds/start.mp3'));
  const stopSoundRef = useRef(new Audio('/sounds/stop.mp3'));

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Recalculate time left for smudge timer
        if (isPlaying && startTimeRef.current) {
          const currentElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const totalElapsed = elapsedTimeRef.current + currentElapsed;
          const newTimeLeft = Math.max(0, 180 - totalElapsed);
          setTimeLeft(newTimeLeft);
          if (newTimeLeft === 0) {
            setIsPlaying(false);
            startTimeRef.current = null;
          }
        }

        // Recalculate time left for hunt cooldown timer
        if (isHuntCooldownPlaying && huntCooldownStartTimeRef.current) {
          const currentElapsed = Math.floor((Date.now() - huntCooldownStartTimeRef.current) / 1000);
          const totalElapsed = huntCooldownElapsedTimeRef.current + currentElapsed;
          const newTimeLeft = Math.max(0, 25 - totalElapsed);
          setHuntCooldownTimeLeft(newTimeLeft);
          if (newTimeLeft === 0) {
            setIsHuntCooldownPlaying(false);
            huntCooldownStartTimeRef.current = null;
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, isHuntCooldownPlaying]);

  // Animation frame update function for smudge timer
  const updateTimer = useCallback(() => {
    if (!isPlaying || !startTimeRef.current) return;

    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const newTimeLeft = Math.max(0, 180 - elapsed);
    setTimeLeft(newTimeLeft);

    if (newTimeLeft === 0) {
      setIsPlaying(false);
      startTimeRef.current = null;
      return;
    }

    animationFrameRef.current = requestAnimationFrame(updateTimer);
  }, [isPlaying]);

  // Animation frame update function for hunt cooldown timer
  const updateHuntCooldownTimer = useCallback(() => {
    if (!isHuntCooldownPlaying || !huntCooldownStartTimeRef.current) return;

    const elapsed = Math.floor((Date.now() - huntCooldownStartTimeRef.current) / 1000);
    const newTimeLeft = Math.max(0, 25 - elapsed);
    setHuntCooldownTimeLeft(newTimeLeft);

    if (newTimeLeft === 0) {
      setIsHuntCooldownPlaying(false);
      huntCooldownStartTimeRef.current = null;
      return;
    }

    huntCooldownAnimationFrameRef.current = requestAnimationFrame(updateHuntCooldownTimer);
  }, [isHuntCooldownPlaying]);

  // Start/stop smudge timer
  const toggleTimer = () => {
    if (isPlaying) {
      // Pausing: accumulate elapsed time
      clearInterval(timerRef.current);
      if (startTimeRef.current) {
        elapsedTimeRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
      }
      stopSoundRef.current.currentTime = 0;
      stopSoundRef.current.play();
      startTimeRef.current = null;
    } else {
      // Starting/Resuming: set new start time
      startSoundRef.current.currentTime = 0;
      startSoundRef.current.play();
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const currentElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const totalElapsed = elapsedTimeRef.current + currentElapsed;
        const newTimeLeft = Math.max(0, 180 - totalElapsed);
        setTimeLeft(newTimeLeft);
        if (newTimeLeft === 0) {
            clearInterval(timerRef.current);
            setIsPlaying(false);
          startTimeRef.current = null;
          }
      }, 100);
    }
    setIsPlaying(!isPlaying);
  };

  // Reset smudge timer
  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setTimeLeft(180);
    startTimeRef.current = null;
    elapsedTimeRef.current = 0; // Reset accumulated elapsed time
    stopSoundRef.current.currentTime = 0;
    stopSoundRef.current.play();
  };

  // Start/stop hunt cooldown timer
  const toggleHuntCooldownTimer = () => {
    if (isHuntCooldownPlaying) {
      // Pausing: accumulate elapsed time
      clearInterval(huntCooldownTimerRef.current);
      if (huntCooldownStartTimeRef.current) {
        huntCooldownElapsedTimeRef.current += Math.floor((Date.now() - huntCooldownStartTimeRef.current) / 1000);
      }
      stopSoundRef.current.currentTime = 0;
      stopSoundRef.current.play();
      huntCooldownStartTimeRef.current = null;
    } else {
      // Starting/Resuming: set new start time
      startSoundRef.current.currentTime = 0;
      startSoundRef.current.play();
      huntCooldownStartTimeRef.current = Date.now();
      huntCooldownTimerRef.current = setInterval(() => {
        const currentElapsed = Math.floor((Date.now() - huntCooldownStartTimeRef.current) / 1000);
        const totalElapsed = huntCooldownElapsedTimeRef.current + currentElapsed;
        const newTimeLeft = Math.max(0, 25 - totalElapsed);
        setHuntCooldownTimeLeft(newTimeLeft);
        if (newTimeLeft === 0) {
            clearInterval(huntCooldownTimerRef.current);
            setIsHuntCooldownPlaying(false);
          huntCooldownStartTimeRef.current = null;
          }
      }, 100);
    }
    setIsHuntCooldownPlaying(!isHuntCooldownPlaying);
  };

  // Reset hunt cooldown timer
  const resetHuntCooldownTimer = () => {
    clearInterval(huntCooldownTimerRef.current);
    setIsHuntCooldownPlaying(false);
    setHuntCooldownTimeLeft(25);
    huntCooldownStartTimeRef.current = null;
    huntCooldownElapsedTimeRef.current = 0; // Reset accumulated elapsed time
    stopSoundRef.current.currentTime = 0;
    stopSoundRef.current.play();
  };

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(huntCooldownTimerRef.current);
    };
  }, []);

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const audioRef = useRef(new Audio('/sounds/banshee_scream.mp3'));

  const handleEvidenceClick = (evidence) => {
    setSelectedEvidence(prev => {
      const currentState = prev[evidence];
      // Toggle between undefined (neutral) and true (included)
      const newState = currentState === undefined ? true : undefined;
      return { ...prev, [evidence]: newState };
    });
  };

  const handleEvidenceExclude = (evidence, e) => {
    e.stopPropagation(); // Prevent the checkbox click
    setSelectedEvidence(prev => {
      const currentState = prev[evidence];
      // Toggle between undefined (neutral) and false (excluded)
      const newState = currentState === undefined ? false : undefined;
      return { ...prev, [evidence]: newState };
    });
  };

  const handleSpeedClick = (speedType) => {
    setSelectedSpeed(prev => {
      const currentState = prev[speedType];
      // Toggle between undefined (neutral) and true (included)
      const newState = currentState === undefined ? true : undefined;
      return { ...prev, [speedType]: newState };
    });
  };

  const handleSpeedExclude = (speedType, e) => {
    e.stopPropagation(); // Prevent the checkbox click
    setSelectedSpeed(prev => {
      const currentState = prev[speedType];
      // Toggle between undefined (neutral) and false (excluded)
      const newState = currentState === undefined ? false : undefined;
      return { ...prev, [speedType]: newState };
    });
  };

  const handleHuntEvidenceClick = (evidence) => {
    setSelectedHuntEvidence(prev => {
      const currentState = prev[evidence];
      let newState;
      if (currentState === undefined) {
        newState = true; // neutral -> included
      } else if (currentState === true) {
        newState = undefined; // included -> neutral
      } else if (currentState === false) {
        newState = undefined; // excluded -> neutral
        
        // When changing from excluded to neutral, check if we should restore any excluded ghosts
        const huntEvidence = huntEvidenceList.find(e => e.id === evidence);
        if (huntEvidence) {
          const affectedGhosts = huntEvidence.ghost.split(', ');
          setExcludedGhosts(prevExcluded => {
            const newExcluded = new Set(prevExcluded);
            
            // For each ghost affected by this evidence
            affectedGhosts.forEach(ghostName => {
              if (newExcluded.has(ghostName)) {
                // Check if this ghost has other excluded evidence that would keep it excluded
                const ghostEvidence = Object.entries(huntEvidenceList)
                  .filter(([_, evidenceData]) => evidenceData.ghost.split(', ').includes(ghostName))
                  .map(([evidenceId]) => evidenceId);
                
                // Check if any other evidence for this ghost is still excluded (false)
                const hasOtherExcludedEvidence = ghostEvidence.some(evidenceId => {
                  if (evidenceId === evidence) return false; // Skip the current evidence we're changing
                  return prev[evidenceId] === false;
                });
                
                // If no other evidence is excluding this ghost, restore it
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
    e.stopPropagation(); // Prevent the checkbox click
    setSelectedHuntEvidence(prev => {
      const currentState = prev[evidence];
      // Toggle between undefined (neutral) and false (excluded)
      const newState = currentState === undefined ? false : undefined;
      return { ...prev, [evidence]: newState };
    });
  };

  const handleSanityClick = (sanityType) => {
    setSelectedSanity(prev => {
      const currentState = prev[sanityType];
      // Toggle between undefined (neutral) and true (included)
      const newState = currentState === undefined ? true : undefined;
      return { ...prev, [sanityType]: newState };
    });
  };

  const handleSanityExclude = (sanityType, e) => {
    e.stopPropagation(); // Prevent the checkbox click
    setSelectedSanity(prev => {
      const currentState = prev[sanityType];
      // Toggle between undefined (neutral) and false (excluded)
      const newState = currentState === undefined ? false : undefined;
      return { ...prev, [sanityType]: newState };
    });
  };

  const getEvidenceLabel = (evidence) => {
    const labels = {
      'EMF 5': 'EMF Level 5',
      'Spirit Box': 'Spirit Box',
      'Ultraviolet': 'Ultraviolet',
      'Ghost Orbs': 'Ghost Orb',
      'Writing': 'Ghost Writing',
      'Freezing': 'Freezing Temperatures',
      'DOTs': 'D.O.T.S Projector'
    };
    return labels[evidence] || evidence;
  };


  const huntEvidenceList = [
    { id: 'hunts_after_smudge_1', label: 'Hunts 1 minute after smudge (use timer under tools tab after smudging)', ghost: 'Demon' },
    { id: 'hunts_after_smudge_3', label: 'Hunts 3 minutes after smudge (use timer under tools tab after smudging)', ghost: 'Spirit' },
    { id: 'no_salt', label: 'Ghost cannot touch salt', ghost: 'Wraith' },
    { id: 'throws_far', label: 'Object thrown every 0.5 seconds and further than usual during hunt', ghost: 'Poltergeist' },
    { id: 'throws_multiple', label: 'Throws multiple objects at the same time', ghost: 'Poltergeist' },
    { id: 'disappears_photo', label: 'Disappears in photos', ghost: 'Phantom' },
    { id: 'less_visible_hunt', label: 'Less visible during hunts', ghost: 'Phantom' },
    { id: 'more_visible_hunt', label: 'More visible during hunts — blinks more often', ghost: 'Oni' },
    { id: 'no_ghost_mist', label: 'Never does ghost mist event', ghost: 'Oni' },
    { id: 'breath_breaker_off', label: 'Ghost has visible breath when breaker is off during hunts', ghost: 'Hantu' },
    { id: 'never_turns_on_breaker', label: 'Ghost never turns on breaker', ghost: 'Hantu' },
    { id: 'faster_cold_rooms', label: "Ghost's movement speed is faster in colder rooms during hunts", ghost: 'Hantu' },
    { id: 'poor_detection', label: "Ghost won't hear/detect you outside of 2.5 meters during hunt", ghost: 'Yokai' },
    { id: 'fast_near_electronics', label: 'Ghost moves faster near active equipment during hunt (activate flashlight near the ghost during safe loop)', ghost: 'Raiju' },
    { id: 'larger_equipment_range', label: 'Effects equipment at 15 meters instead of 10 meters during hunt', ghost: 'Raiju' },
    { id: 'silent_footsteps', label: "Cannot hear ghost's footsteps when on the same storey until within 12m range during hunts (test with flashlight standard 10m disruption)", ghost: 'Myling' },
    { id: 'alternating_speed', label: 'Hunt speed alternates between slightly slower and faster than normal on each new hunt', ghost: 'The Twins' },
    { id: 'changes_model', label: 'Ghost model changes briefly during hunt', ghost: 'Obake' },
    { id: 'slows_on_meds', label: 'Ghost hunt speed is tied to sanity (slows when taking meds mid hunt)', ghost: 'Moroi' },
    { id: 'fast_far_slow_close', label: "Ghost has fastest hunt movement speed in game when far, slowest movement speed in game when close", ghost: 'Deogen' },
    { id: 'cant_turn_lights', label: 'Ghost cannot turn on lights', ghost: 'Mare' },
    { id: 'turns_off_lights', label: "Ghost turns lights off immediately after they're turned on (when ghost is within 4 meters)", ghost: 'Mare' },
    { id: 'prefers_light_events', label: 'Prefers light bursting events and turning lights off', ghost: 'Mare' },
    { id: 'wanders_to_dark', label: "Wanders out of rooms with light into rooms without light (only lights effected by breaker count, wandering happens outside of hunting)", ghost: 'Mare' },
    { id: 'screams_parabolic', label: 'Unique scream heard on parabolic mic', ghost: 'Banshee' },
    { id: 'hunt_speed_decreases', label: "Ghost has gradually slower hunt speeds as players spend more time in the ghost's favorite room", ghost: 'Thaye' },
    { id: 'double_slam', label: 'Ghost double touches doors and slams doors', ghost: 'Yurei' },
    { id: 'interacts_main_door', label: 'Ghost interacts with the main door outside of ghost event and hunts', ghost: 'Yurei' },
    { id: 'never_changes_rooms', label: 'Ghost never changes favorite room', ghost: 'Goryo, Banshee' },
    { id: 'hunts_after_candles', label: 'Ghost hunts after every third flame extinguished (single candle, candelabra, lit igniter all = 1 flame)', ghost: 'Onryo' },
    { id: 'cant_light_fire', label: 'Ghost cannot light any fire sources (unless forced by a voodoo doll)', ghost: 'Onryo' },
    { id: 'no_hunt_in_room', label: "Ghost won't hunt while players are in it's favorite room", ghost: 'Shade' },
    { id: 'speed_with_breaker', label: "Ghost's hunt speed is fast when breaker is on and player is far away", ghost: 'Jinn' },
    { id: 'never_turns_off_breaker', label: 'Ghost never turns off breaker', ghost: 'Jinn' },
    { id: 'hunts_20s', label: 'Hunts again in 20 seconds instead of 25 (easiest to test at 0 sanity)', ghost: 'Demon' },
    { id: 'speed_when_hiding', label: "Ghost's hunt speed is extremely slow when player isn't detected, and very fast when it detects a player", ghost: 'Revenant' }
  ];

  const isEvidenceInSearchResults = (evidence) => {
    if (!searchQuery) return false;
    return ghosts.some(ghost => 
      ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase().trim()) && 
      ghostCanHaveEvidence(ghost, evidence)
    );
  };

  // Helper function to check if a ghost can have specific evidence (includes Mimic special case)
  const ghostCanHaveEvidence = (ghost, evidence) => {
    // Check official evidence
    if (ghost.evidence.includes(evidence)) {
      return true;
    }
    
    // Special case: Mimic always shows Ghost Orbs as additional evidence
    if (ghost.ghost === 'The Mimic' && evidence === 'Ghost Orbs') {
      return true;
    }
    
    return false;
  };

  const isEvidenceImpossible = (evidenceToCheck) => {
    // Get all ghosts that would pass current filters (excluding the evidence we're checking)
    const remainingGhosts = ghosts.filter(ghost => {
      // Check evidence filters (excluding the evidence we're checking)
      const evidenceMatch = Object.entries(selectedEvidence).every(([evidence, state]) => {
        if (evidence === evidenceToCheck || state === undefined) return true;
        if (state === true) return ghostCanHaveEvidence(ghost, evidence);
        if (state === false) return !ghostCanHaveEvidence(ghost, evidence);
        return true;
      });

      // Check speed filters
      const speedMatch = Object.entries(selectedSpeed).every(([speedType, state]) => {
        if (state === undefined) return true;
        
        const minSpeed = parseFloat(ghost.min_speed);
        const maxSpeed = parseFloat(ghost.max_speed);
        const altSpeed = parseFloat(ghost.alt_speed);
        const normalSpeed = 1.7;
        
        const speeds = [];
        if (!isNaN(minSpeed)) speeds.push(minSpeed);
        if (!isNaN(maxSpeed)) speeds.push(maxSpeed);
        if (!isNaN(altSpeed)) speeds.push(altSpeed);
        
        if (speeds.length === 0) return true;
        
        switch (speedType) {
          case 'slow':
            if (state === true) return speeds.some(speed => speed < normalSpeed);
            if (state === false) return speeds.every(speed => speed >= normalSpeed);
            break;
          case 'normal':
            if (state === true) return speeds.every(speed => speed === normalSpeed);
            if (state === false) return speeds.some(speed => speed !== normalSpeed);
            break;
          case 'fast':
            if (state === true) return speeds.some(speed => speed > normalSpeed);
            if (state === false) return speeds.every(speed => speed <= normalSpeed);
            break;
          case 'los':
            if (state === true) return ghost.has_los === true;
            if (state === false) return ghost.has_los === false;
            break;
        }
        return true;
      });

      // Check hunt evidence filters
      const huntEvidenceMatch = Object.entries(selectedHuntEvidence).every(([evidence, state]) => {
        if (state === undefined) return true;
        const huntEvidence = huntEvidenceList.find(e => e.id === evidence);
        if (!huntEvidence) return true;
        const ghostNames = huntEvidence.ghost.split(', ');
        if (state === true) return ghostNames.includes(ghost.ghost);
        if (state === false) return !ghostNames.includes(ghost.ghost);
        return true;
      });

      // Check sanity filters
      const sanityMatch = Object.entries(selectedSanity).every(([sanityType, state]) => {
        if (state === undefined) return true;
        
        const sanity = parseFloat(ghost.hunt_sanity) || 0;
        const sanityLow = parseFloat(ghost.hunt_sanity_low) || sanity;
        const sanityHigh = parseFloat(ghost.hunt_sanity_high) || sanity;
        
        let hasThisSanityRange = false;
        switch (sanityType) {
          case 'high':
            hasThisSanityRange = sanityHigh >= 80 && sanityHigh <= 100;
            break;
          case 'medium':
            hasThisSanityRange = sanityHigh >= 60 && sanityHigh <= 80;
            break;
          case 'fifty':
            hasThisSanityRange = sanity === 50;
            break;
          case 'low':
            hasThisSanityRange = sanityLow > 0 && sanityLow <= 40;
            break;
        }
        
        if (state === true) return hasThisSanityRange;
        if (state === false) return !hasThisSanityRange;
        return true;
      });

      return evidenceMatch && speedMatch && huntEvidenceMatch && sanityMatch;
    });

    // Check if any remaining ghosts have this evidence
    return !remainingGhosts.some(ghost => ghostCanHaveEvidence(ghost, evidenceToCheck));
  };

  const isSpeedInSearchResults = (speedType) => {
    if (!searchQuery) return false;
    return ghosts.some(ghost => {
      if (!ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase().trim())) return false;
      
      const minSpeed = parseFloat(ghost.min_speed);
      const maxSpeed = parseFloat(ghost.max_speed);
      const altSpeed = parseFloat(ghost.alt_speed);
      const normalSpeed = 1.7;
      
      const speeds = [];
      if (!isNaN(minSpeed)) speeds.push(minSpeed);
      if (!isNaN(maxSpeed)) speeds.push(maxSpeed);
      if (!isNaN(altSpeed)) speeds.push(altSpeed);
      
      if (speeds.length === 0) return false;
      
      switch (speedType) {
        case 'slow':
          return speeds.some(speed => speed < normalSpeed);
        case 'normal':
          return speeds.every(speed => speed === normalSpeed);
        case 'fast':
          return speeds.some(speed => speed > normalSpeed);
        case 'los':
          return ghost.has_los === true;
      }
      return false;
    });
  };

  const isHuntEvidenceInSearchResults = (evidence) => {
    if (!searchQuery) return false;
    const huntEvidence = huntEvidenceList.find(e => e.id === evidence);
    if (!huntEvidence) return false;
    const ghostNames = huntEvidence.ghost.split(', ');
    return ghosts.some(ghost => 
      ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase().trim()) && 
      ghostNames.includes(ghost.ghost)
    );
  };

  const isSanityInSearchResults = (sanityType) => {
    if (!searchQuery) return false;
    return ghosts.some(ghost => {
      if (!ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase().trim())) return false;
      
      const sanity = parseFloat(ghost.hunt_sanity) || 0;
      const sanityLow = parseFloat(ghost.hunt_sanity_low) || sanity;
      const sanityHigh = parseFloat(ghost.hunt_sanity_high) || sanity;
      
      switch (sanityType) {
        case 'high':
          return sanityHigh >= 80 && sanityHigh <= 100;
        case 'medium':
          return sanityHigh >= 60 && sanityHigh <= 80;
        case 'fifty':
          return sanity === 50;
        case 'low':
          return sanityLow > 0 && sanityLow <= 40;
      }
      return false;
    });
  };

  const isGhostFilteredOut = (ghostName) => {
    return !ghosts.some(ghost => {
      if (ghost.ghost !== ghostName) return false;

      // Check evidence filters
      const evidenceMatch = Object.entries(selectedEvidence).every(([evidence, state]) => {
        if (state === undefined) return true;
        if (state === true) return ghostCanHaveEvidence(ghost, evidence);
        if (state === false) return !ghostCanHaveEvidence(ghost, evidence);
        return true;
      });

      // Check speed filters
      const speedMatch = Object.entries(selectedSpeed).every(([speedType, state]) => {
        if (state === undefined) return true;
        
        const minSpeed = parseFloat(ghost.min_speed);
        const maxSpeed = parseFloat(ghost.max_speed);
        const altSpeed = parseFloat(ghost.alt_speed);
        const normalSpeed = 1.7;
        
        const speeds = [];
        if (!isNaN(minSpeed)) speeds.push(minSpeed);
        if (!isNaN(maxSpeed)) speeds.push(maxSpeed);
        if (!isNaN(altSpeed)) speeds.push(altSpeed);
        
        if (speeds.length === 0) return true;
        
        switch (speedType) {
          case 'slow':
            if (state === true) return speeds.some(speed => speed < normalSpeed);
            if (state === false) return speeds.every(speed => speed >= normalSpeed);
            break;
          case 'normal':
            if (state === true) return speeds.every(speed => speed === normalSpeed);
            if (state === false) return speeds.some(speed => speed !== normalSpeed);
            break;
          case 'fast':
            if (state === true) return speeds.some(speed => speed > normalSpeed);
            if (state === false) return speeds.every(speed => speed <= normalSpeed);
            break;
          case 'los':
            if (state === true) return ghost.has_los === true;
            if (state === false) return ghost.has_los === false;
            break;
        }
        return true;
      });

      // Check hunt evidence filters
      const huntEvidenceMatch = Object.entries(selectedHuntEvidence).every(([evidence, state]) => {
        if (state === undefined) return true;
        const huntEvidence = huntEvidenceList.find(e => e.id === evidence);
        if (!huntEvidence) return true;
        const ghostNames = huntEvidence.ghost.split(', ');
        if (state === true) {
          // If this evidence is selected, the ghost must be in the list
          return ghostNames.includes(ghost.ghost);
        }
        if (state === false) {
          // If this evidence is excluded, the ghost must not be in the list
          return !ghostNames.includes(ghost.ghost);
        }
        return true;
      });

      // Check sanity filters
      const sanityMatch = Object.entries(selectedSanity).every(([sanityType, state]) => {
        if (state === undefined) return true;
        
        const sanity = parseFloat(ghost.hunt_sanity) || 0;
        const sanityLow = parseFloat(ghost.hunt_sanity_low) || sanity;
        const sanityHigh = parseFloat(ghost.hunt_sanity_high) || sanity;
        
        let hasThisSanityRange = false;
        switch (sanityType) {
          case 'high':
            hasThisSanityRange = sanityHigh >= 80 && sanityHigh <= 100;
            break;
          case 'medium':
            hasThisSanityRange = sanityHigh >= 60 && sanityHigh <= 80;
            break;
          case 'fifty':
            hasThisSanityRange = sanity === 50;
            break;
          case 'low':
            hasThisSanityRange = sanityLow > 0 && sanityLow <= 40;
            break;
        }
        
        if (state === true) return hasThisSanityRange;
        if (state === false) return !hasThisSanityRange;
        return true;
      });

      return evidenceMatch && speedMatch && huntEvidenceMatch && sanityMatch;
    });
  };

  const playBansheeScream = (e) => {
    e.stopPropagation(); // Prevent the checkbox from being clicked
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  const getGhostSpeed = (ghost) => {
    const speeds = [];
    if (ghost.min_speed) speeds.push(parseFloat(ghost.min_speed));
    if (ghost.max_speed) speeds.push(parseFloat(ghost.max_speed));
    if (ghost.alt_speed) speeds.push(parseFloat(ghost.alt_speed));
    return speeds;
  };

  const getGhostSanity = (ghost, sortType) => {
    // Convert sanity values to numbers, removing the % sign
    const sanity = ghost.hunt_sanity ? parseFloat(ghost.hunt_sanity) : null;
    const sanityLow = ghost.hunt_sanity_low ? parseFloat(ghost.hunt_sanity_low) : null;
    const sanityHigh = ghost.hunt_sanity_high ? parseFloat(ghost.hunt_sanity_high) : null;

    // For highest sanity sorting, use the highest possible value
    if (sortType === 'highest') {
      if (sanityHigh !== null) {
        return sanityHigh;
      }
      if (sanity !== null) {
        return sanity;
      }
      if (sanityLow !== null) {
        return sanityLow;
      }
    }
    // For lowest sanity sorting, use the lowest possible value
    else {
      if (sanityLow !== null) {
        return sanityLow;
      }
      if (sanity !== null) {
        return sanity;
      }
      if (sanityHigh !== null) {
        return sanityHigh;
      }
    }
    // Default to 0 if no sanity value is found
    return 0;
  };

  const sortGhosts = (ghosts) => {
    switch (sortOrder) {
      case 'default':
        return ghosts;
      case 'fastest':
        return [...ghosts].sort((a, b) => {
          const aSpeeds = getGhostSpeed(a);
          const bSpeeds = getGhostSpeed(b);
          const aMax = Math.max(...aSpeeds);
          const bMax = Math.max(...bSpeeds);
          return bMax - aMax;
        });
      case 'slowest':
        return [...ghosts].sort((a, b) => {
          const aSpeeds = getGhostSpeed(a);
          const bSpeeds = getGhostSpeed(b);
          const aMin = Math.min(...aSpeeds);
          const bMin = Math.min(...bSpeeds);
          return aMin - bMin;
        });
      case 'sanity_highest':
        return [...ghosts].sort((a, b) => getGhostSanity(b, 'highest') - getGhostSanity(a, 'highest'));
      case 'sanity_lowest':
        return [...ghosts].sort((a, b) => getGhostSanity(a, 'lowest') - getGhostSanity(b, 'lowest'));
      case 'alphabetical':
        return [...ghosts].sort((a, b) => a.ghost.localeCompare(b.ghost));
      case 'alphabetical_reversed':
        return [...ghosts].sort((a, b) => b.ghost.localeCompare(a.ghost));
      default:
        return ghosts;
    }
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
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  // Reset all evidence states
                  const resetEvidence = Object.keys(selectedEvidence).reduce((acc, key) => {
                    acc[key] = undefined;
                    return acc;
                  }, {});
                  setSelectedEvidence(resetEvidence);

                  // Reset all speed states
                  const resetSpeed = Object.keys(selectedSpeed).reduce((acc, key) => {
                    acc[key] = undefined;
                    return acc;
                  }, {});
                  setSelectedSpeed(resetSpeed);

                  // Reset all hunt evidence states
                  const resetHuntEvidence = Object.keys(selectedHuntEvidence).reduce((acc, key) => {
                    acc[key] = undefined;
                    return acc;
                  }, {});
                  setSelectedHuntEvidence(resetHuntEvidence);

                  // Reset all sanity states
                  const resetSanity = Object.keys(selectedSanity).reduce((acc, key) => {
                    acc[key] = undefined;
                    return acc;
                  }, {});
                  setSelectedSanity(resetSanity);

                  // Reset excluded ghosts
                  setExcludedGhosts(new Set());

                  // Reset sort order to default
                  setSortOrder('default');

                  // Stop and reset all timers
                  clearInterval(timerRef.current);
                  clearInterval(huntCooldownTimerRef.current);
                  setIsPlaying(false);
                  setIsHuntCooldownPlaying(false);
                  setTimeLeft(180);
                  setHuntCooldownTimeLeft(25);
                  startTimeRef.current = null;
                  huntCooldownStartTimeRef.current = null;
                  elapsedTimeRef.current = 0;
                  huntCooldownElapsedTimeRef.current = 0;

                  // Clear search
                  setSearchQuery('');
                  // Clear hunt evidence search
                  setHuntEvidenceSearch('');
                }}
                startIcon={<RestartAltIcon />}
              >
                Reset All
              </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer' }} onClick={() => setEvidenceExpanded(!evidenceExpanded)}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Standard Evidence
      </Typography>
              <IconButton>
                {evidenceExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={evidenceExpanded}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              {[
                'EMF 5',
                'Spirit Box',
                'Ultraviolet',
                'Ghost Orbs',
                'Writing',
                'Freezing',
                'DOTs'
              ]
                .slice()
                .sort((a, b) => {
                  // First sort by impossible status
                  const aImpossible = isEvidenceImpossible(a);
                  const bImpossible = isEvidenceImpossible(b);
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
                  const isImpossible = isEvidenceImpossible(evidence);
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
                      onClick={() => handleEvidenceClick(evidence)}
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
                        onClick={(e) => handleEvidenceExclude(evidence, e)}
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

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer' }} onClick={() => setSpeedExpanded(!speedExpanded)}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Speed
            </Typography>
              <IconButton>
                {speedExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={speedExpanded}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              {[
                { id: 'slow', label: 'Slow (< 1.7 m/s)' },
                { id: 'normal', label: 'Normal (1.7 m/s)' },
                { id: 'fast', label: 'Fast (> 1.7 m/s)' },
                { id: 'los', label: 'LOS Speed Up' }
              ]
                .slice()
                .sort((a, b) => {
                    // Only sort by search match
                  const aMatchesSearch = isSpeedInSearchResults(a.id);
                  const bMatchesSearch = isSpeedInSearchResults(b.id);
                  if (aMatchesSearch !== bMatchesSearch) {
                    return aMatchesSearch ? -1 : 1;
                  }

                    // Maintain original order
                  return 0;
                })
                .map((speed) => {
                  const isFiltered = !ghosts.some(ghost => {
                    if (!ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase().trim())) return false;
                    
                    const minSpeed = parseFloat(ghost.min_speed);
                    const maxSpeed = parseFloat(ghost.max_speed);
                    const altSpeed = parseFloat(ghost.alt_speed);
                    const normalSpeed = 1.7;
                    
                    const speeds = [];
                    if (!isNaN(minSpeed)) speeds.push(minSpeed);
                    if (!isNaN(maxSpeed)) speeds.push(maxSpeed);
                    if (!isNaN(altSpeed)) speeds.push(altSpeed);
                    
                    if (speeds.length === 0) return false;
                    
                    switch (speed.id) {
                      case 'slow':
                        return speeds.some(speed => speed < normalSpeed);
                      case 'normal':
                        return speeds.every(speed => speed === normalSpeed);
                      case 'fast':
                        return speeds.some(speed => speed > normalSpeed);
                      case 'los':
                        return ghost.has_los === true;
                    }
                    return false;
                  });
                  const isExcluded = selectedSpeed[speed.id] === false;
                  const isIncluded = selectedSpeed[speed.id] === true;
                  return (
                    <Box
                      key={speed.id}
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
                        opacity: isFiltered ? 0.5 : 1,
                      }}
                      onClick={() => handleSpeedClick(speed.id)}
                    >
                      <Checkbox
                        checked={isIncluded}
                        sx={{
                          color: isFiltered ? 'text.disabled' : 'text.secondary',
                          '&.Mui-checked': {
                            color: isFiltered ? 'text.disabled' : 'success.main',
                          },
                        }}
                      />
                      <Box sx={{ 
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        color: isFiltered ? 'text.disabled' :
                               isExcluded ? 'error.main' :
                               isIncluded ? 'success.main' :
                               'text.primary'
                      }}>
                        {speed.label}
                        {isSpeedInSearchResults(speed.id) && (
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
                        onClick={(e) => handleSpeedExclude(speed.id, e)}
                        sx={{
                          color: isExcluded ? 'error.main' : 'text.secondary',
                          '&:hover': {
                            color: 'error.main',
                          },
                          opacity: isFiltered ? 0.5 : 1,
                        }}
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                })}
            </Box>
            </Collapse>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer' }} onClick={() => setSanityExpanded(!sanityExpanded)}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Hunt Sanity
            </Typography>
              <IconButton>
                {sanityExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={sanityExpanded}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              {[
                { id: 'high', label: '100%-80%' },
                { id: 'medium', label: '80%-60%' },
                { id: 'fifty', label: '50%' },
                { id: 'low', label: '> 40%' }
              ]
                .slice()
                .sort((a, b) => {
                    // Only sort by search match
                  const aMatchesSearch = isSanityInSearchResults(a.id);
                  const bMatchesSearch = isSanityInSearchResults(b.id);
                  if (aMatchesSearch !== bMatchesSearch) {
                    return aMatchesSearch ? -1 : 1;
                  }

                    // Maintain original order
                  return 0;
                })
                .map((sanity) => {
                  const isFiltered = !ghosts.some(ghost => {
                    if (!ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase().trim())) return false;
                    
                    const sanityValue = parseFloat(ghost.hunt_sanity) || 0;
                    const sanityLow = parseFloat(ghost.hunt_sanity_low) || sanityValue;
                    const sanityHigh = parseFloat(ghost.hunt_sanity_high) || sanityValue;
                    
                    switch (sanity.id) {
                      case 'high':
                        return sanityHigh >= 80 && sanityHigh <= 100;
                      case 'medium':
                        return sanityHigh >= 60 && sanityHigh <= 80;
                      case 'fifty':
                        return sanityValue === 50;
                      case 'low':
                        return sanityLow > 0 && sanityLow <= 40;
                    }
                    return false;
                  });
                  const isExcluded = selectedSanity[sanity.id] === false;
                  const isIncluded = selectedSanity[sanity.id] === true;
                  return (
                    <Box
                      key={sanity.id}
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
                        opacity: isFiltered ? 0.5 : 1,
                      }}
                      onClick={() => handleSanityClick(sanity.id)}
                    >
                      <Checkbox
                        checked={isIncluded}
                        sx={{
                          color: isFiltered ? 'text.disabled' : 'text.secondary',
                          '&.Mui-checked': {
                            color: isFiltered ? 'text.disabled' : 'success.main',
                          },
                        }}
                      />
                      <Box sx={{ 
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        color: isFiltered ? 'text.disabled' :
                               isExcluded ? 'error.main' :
                               isIncluded ? 'success.main' :
                               'text.primary'
                      }}>
                        {sanity.label}
                        {isSanityInSearchResults(sanity.id) && (
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
                        onClick={(e) => handleSanityExclude(sanity.id, e)}
                        sx={{
                          color: isExcluded ? 'error.main' : 'text.secondary',
                          '&:hover': {
                            color: 'error.main',
                          },
                          opacity: isFiltered ? 0.5 : 1,
                        }}
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                })}
            </Box>
            </Collapse>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer' }} onClick={() => setHuntEvidenceExpanded(!huntEvidenceExpanded)}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Unique Evidence
            </Typography>
              <IconButton>
                {huntEvidenceExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={huntEvidenceExpanded}>
            <TextField
              fullWidth
              variant="outlined"
                placeholder="Search unique evidence..."
              value={huntEvidenceSearch}
              onChange={(e) => setHuntEvidenceSearch(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: huntEvidenceSearch && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setHuntEvidenceSearch('')}
                      edge="end"
                      size="small"
                    >
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {huntEvidenceList
                .slice()
                .sort((a, b) => {
                  // First sort by filtered status
                  const aFiltered = a.ghost.split(', ').every(ghostName => isGhostFilteredOut(ghostName));
                  const bFiltered = b.ghost.split(', ').every(ghostName => isGhostFilteredOut(ghostName));
                  if (aFiltered !== bFiltered) {
                    return aFiltered ? 1 : -1;
                  }

                  // Then sort by search match
                  const aMatchesSearch = huntEvidenceSearch && 
                    a.label.toLowerCase().includes(huntEvidenceSearch.toLowerCase());
                  const bMatchesSearch = huntEvidenceSearch && 
                    b.label.toLowerCase().includes(huntEvidenceSearch.toLowerCase());
                  if (aMatchesSearch !== bMatchesSearch) {
                    return aMatchesSearch ? -1 : 1;
                  }

                  // Then sort by ghost match if there's a search query
                  if (searchQuery) {
                    const aGhostMatches = a.ghost.split(', ').some(ghostName => 
                      ghostName.toLowerCase().includes(searchQuery.toLowerCase().trim())
                    );
                    const bGhostMatches = b.ghost.split(', ').some(ghostName => 
                      ghostName.toLowerCase().includes(searchQuery.toLowerCase().trim())
                    );
                    if (aGhostMatches !== bGhostMatches) {
                      return aGhostMatches ? -1 : 1;
                    }
                  }

                  // Finally sort by the current ghost order
                  const aGhosts = a.ghost.split(', ');
                  const bGhosts = b.ghost.split(', ');
                  
                  // Get the sorted ghosts
                  const sortedGhosts = sortGhosts(ghosts);
                  const ghostOrder = sortedGhosts.reduce((acc, ghost, index) => {
                    acc[ghost.ghost] = index;
                    return acc;
                  }, {});

                  // Find the minimum index for each evidence's ghosts
                  const aMinIndex = Math.min(...aGhosts.map(g => ghostOrder[g] ?? Infinity));
                  const bMinIndex = Math.min(...bGhosts.map(g => ghostOrder[g] ?? Infinity));
                  return aMinIndex - bMinIndex;
                })
                .map((evidence) => {
                  const isFiltered = evidence.ghost.split(', ').every(ghostName => isGhostFilteredOut(ghostName));
                  const matchesSearch = huntEvidenceSearch && 
                    evidence.label.toLowerCase().includes(huntEvidenceSearch.toLowerCase());
                  const isExcluded = selectedHuntEvidence[evidence.id] === false;
                  const isIncluded = selectedHuntEvidence[evidence.id] === true;
                  return (
                    <Box
                      key={evidence.id}
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
                        opacity: isFiltered ? 0.5 : 1,
                      }}
                      onClick={() => handleHuntEvidenceClick(evidence.id)}
                    >
                      <Checkbox
                        checked={isIncluded}
                        sx={{
                          color: isFiltered ? 'text.disabled' : 'text.secondary',
                          '&.Mui-checked': {
                            color: isFiltered ? 'text.disabled' : 'success.main',
                          },
                        }}
                      />
                      <Box sx={{ 
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        color: isFiltered ? 'text.disabled' :
                               isExcluded ? 'error.main' :
                               isIncluded ? 'success.main' :
                               'text.primary'
                      }}>
                        {evidence.label}
                        {isHuntEvidenceInSearchResults(evidence.id) && (
                          <FilterAltIcon 
                            sx={{ 
                              ml: 1, 
                              fontSize: '1rem',
                              color: 'primary.main',
                              opacity: 0.7
                            }} 
                          />
                        )}
                        {matchesSearch && (
                          <SearchIcon 
                            sx={{ 
                              ml: 1, 
                              fontSize: '1rem',
                              color: 'primary.main',
                              opacity: 0.7
                            }} 
                          />
                        )}
                        {evidence.id === 'screams_parabolic' && (
                          <IconButton
                            onClick={playBansheeScream}
                            size="small"
                            sx={{
                              ml: 1,
                              color: isFiltered ? 'text.disabled' : 'white',
                              '&:hover': {
                                color: isFiltered ? 'text.disabled' : 'primary.main'
                              }
                            }}
                          >
                            <VolumeUpIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleHuntEvidenceExclude(evidence.id, e)}
                        sx={{
                          color: isExcluded ? 'error.main' : 'text.secondary',
                          '&:hover': {
                            color: 'error.main',
                          },
                          opacity: isFiltered ? 0.5 : 1,
                        }}
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                })}
            </Box>
            </Collapse>
          </Box>
        ) : activeTab === 1 ? (
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Smudge Timer
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Demon - 1 minute<br />
                Spirit - 3 minutes<br />
                All other ghosts - 1 minute 30 seconds
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h4" component="div" sx={{ fontFamily: 'monospace' }}>
                  {formatTime(timeLeft)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={toggleTimer}
                  startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                >
                  {isPlaying ? 'Pause' : 'Start'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={resetTimer}
                  startIcon={<StopIcon />}
                >
                  Reset
                </Button>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Hunt Cooldown
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Demon - 20 seconds<br />
                All other ghosts - 25 seconds
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h4" component="div" sx={{ fontFamily: 'monospace' }}>
                  {formatTime(huntCooldownTimeLeft)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={toggleHuntCooldownTimer}
                  startIcon={isHuntCooldownPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                >
                  {isHuntCooldownPlaying ? 'Pause' : 'Start'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={resetHuntCooldownTimer}
                  startIcon={<StopIcon />}
                >
                  Reset
                </Button>
              </Box>
            </Box>
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