// Shared filtering utility functions
import { ghostCanHaveEvidence, ghostCanHaveHuntEvidence } from './ghostUtils';

// Memoize Object.entries calls
const memoizedEntries = new Map();
const getEntries = (obj) => {
  const key = JSON.stringify(obj);
  if (!memoizedEntries.has(key)) {
    memoizedEntries.set(key, Object.entries(obj));
  }
  return memoizedEntries.get(key);
};

export const checkGhostFilters = (ghost, filters) => {
  const { selectedEvidence, selectedSpeed, selectedHuntEvidence, selectedSanity, huntEvidenceList } = filters;

  // Check evidence filters with memoized entries
  const evidenceEntries = getEntries(selectedEvidence);
  const evidenceMatch = evidenceEntries.every(([evidence, state]) => {
    if (state === undefined) return true;
    if (state === true) return ghostCanHaveEvidence(ghost, evidence);
    if (state === false) return !ghostCanHaveEvidence(ghost, evidence);
    return true;
  });

  // Check speed filters with memoized entries
  const speedEntries = getEntries(selectedSpeed);
  const speedMatch = speedEntries.every(([speedType, state]) => {
    if (state === undefined) return true;
    
    // The Mimic can mimic any ghost's speed, so it passes all speed filters when included
    if (ghost.ghost === 'The Mimic' && state === true) {
      return true;
    }
    
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

  // Check hunt evidence filters with memoized entries
  const huntEvidenceEntries = getEntries(selectedHuntEvidence);
  const huntEvidenceMatch = huntEvidenceEntries.every(([evidence, state]) => {
    if (state === undefined) return true;
    if (state === true) return ghostCanHaveHuntEvidence(ghost, evidence, huntEvidenceList);
    if (state === false) return !ghostCanHaveHuntEvidence(ghost, evidence, huntEvidenceList);
    return true;
  });

  // Check sanity filters with memoized entries
  const sanityEntries = getEntries(selectedSanity);
  const sanityMatch = sanityEntries.every(([sanityType, state]) => {
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
};

export const isEvidenceImpossible = (evidenceToCheck, filters, ghosts) => {
  if (!ghosts || !Array.isArray(ghosts)) return false;
  const { selectedEvidence, selectedSpeed, selectedHuntEvidence, selectedSanity, huntEvidenceList } = filters;
  
  // Get all ghosts that would pass current filters (excluding the evidence we're checking)
  const remainingGhosts = ghosts.filter(ghost => {
    // Check evidence filters (excluding the evidence we're checking)
    const evidenceMatch = Object.entries(selectedEvidence).every(([evidence, state]) => {
      if (evidence === evidenceToCheck || state === undefined) return true;
      if (state === true) return ghostCanHaveEvidence(ghost, evidence);
      if (state === false) return !ghostCanHaveEvidence(ghost, evidence);
      return true;
    });

    // Check other filters normally
    const otherFilters = { selectedSpeed, selectedHuntEvidence, selectedSanity, huntEvidenceList };
    const speedMatch = checkSpeedFilters(ghost, selectedSpeed);
    const huntEvidenceMatch = checkHuntEvidenceFilters(ghost, selectedHuntEvidence, huntEvidenceList);
    const sanityMatch = checkSanityFilters(ghost, selectedSanity);

    return evidenceMatch && speedMatch && huntEvidenceMatch && sanityMatch;
  });

  // Check if any remaining ghosts have this evidence
  return !remainingGhosts.some(ghost => ghostCanHaveEvidence(ghost, evidenceToCheck));
};

export const isGhostFilteredOut = (ghostName, filters, ghosts) => {
  if (!ghosts || !Array.isArray(ghosts)) return false;
  return !ghosts.some(ghost => {
    if (ghost.ghost !== ghostName) return false;
    return checkGhostFilters(ghost, filters);
  });
};

// Helper functions for individual filter types
const checkSpeedFilters = (ghost, selectedSpeed) => {
  return Object.entries(selectedSpeed).every(([speedType, state]) => {
    if (state === undefined) return true;
    
    // The Mimic can mimic any ghost's speed, so it passes all speed filters when included
    if (ghost.ghost === 'The Mimic' && state === true) {
      return true;
    }
    
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
};

const checkHuntEvidenceFilters = (ghost, selectedHuntEvidence, huntEvidenceList) => {
  return Object.entries(selectedHuntEvidence).every(([evidence, state]) => {
    if (state === undefined) return true;
    if (state === true) return ghostCanHaveHuntEvidence(ghost, evidence, huntEvidenceList);
    if (state === false) return !ghostCanHaveHuntEvidence(ghost, evidence, huntEvidenceList);
    return true;
  });
};

const checkSanityFilters = (ghost, selectedSanity) => {
  return Object.entries(selectedSanity).every(([sanityType, state]) => {
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
};