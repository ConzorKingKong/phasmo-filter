// Shared ghost-related utility functions

export const getEvidenceLabel = (evidence) => {
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

// Helper function to check if a ghost can have specific evidence (includes Mimic special case)
export const ghostCanHaveEvidence = (ghost, evidence) => {
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

// Helper function to check if a ghost can have specific hunt evidence (includes Mimic special case)
export const ghostCanHaveHuntEvidence = (ghost, evidenceId, huntEvidenceList) => {
  const huntEvidence = huntEvidenceList.find(e => e.id === evidenceId);
  if (!huntEvidence) return false;
  
  const ghostNames = huntEvidence.ghost.split(', ');
  
  // Check if this ghost is directly associated with this evidence
  if (ghostNames.includes(ghost.ghost)) {
    return true;
  }
  
  // Special case: Mimic can copy any ghost's unique traits
  if (ghost.ghost === 'The Mimic') {
    return true;
  }
  
  return false;
};

export const getGhostSpeed = (ghost) => {
  const speeds = [];
  if (ghost.min_speed) speeds.push(parseFloat(ghost.min_speed));
  if (ghost.max_speed) speeds.push(parseFloat(ghost.max_speed));
  if (ghost.alt_speed) speeds.push(parseFloat(ghost.alt_speed));
  return speeds;
};

export const getGhostSanity = (ghost, sortType) => {
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

export const sortGhosts = (ghosts, sortOrder) => {
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