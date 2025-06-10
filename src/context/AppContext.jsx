import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useTimerWorker } from '../hooks/useTimerWorker'

const AppContext = createContext()

export const useApp = () => useContext(AppContext)

export const AppProvider = ({ children }) => {
  const [ghosts, setGhosts] = useState([])
  const [selectedEvidence, setSelectedEvidence] = useState({})
  const [selectedSpeed, setSelectedSpeed] = useState({})
  const [selectedHuntEvidence, setSelectedHuntEvidence] = useState({})
  const [selectedSanity, setSelectedSanity] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [excludedGhosts, setExcludedGhosts] = useState(new Set())
  const [sortOrder, setSortOrder] = useState('default')
  const [settings, setSettings] = useState({
    darkMode: true,
    fontSize: 'medium'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Timer worker
  const timerWorker = useTimerWorker()
  
  // Timer states
  const [smudgeTimer, setSmudgeTimer] = useState({
    isPlaying: false,
    timeLeft: 180, // 3 minutes in seconds
    elapsedTime: 0
  })
  const [huntCooldownTimer, setHuntCooldownTimer] = useState({
    isPlaying: false,
    timeLeft: 25, // 25 seconds
    elapsedTime: 0
  })

  useEffect(() => {
    const fetchGhosts = async () => {
      try {
        const response = await fetch('/data/ghosts-v1-000-015.json')
        if (!response.ok) {
          throw new Error('Failed to fetch ghost data')
        }
        const data = await response.json()
        setGhosts(data.ghosts || [])
        setIsLoading(false)
      } catch (err) {
        setError(err.message)
        setIsLoading(false)
      }
    }

    fetchGhosts()
  }, [])

  // Set up timer worker listeners
  useEffect(() => {
    const smudgeCleanup = timerWorker.addListener('smudge', (data) => {
      if (data.paused) {
        setSmudgeTimer(prev => ({
          ...prev,
          isPlaying: false,
          elapsedTime: data.totalElapsed
        }))
      } else if (data.stopped || data.reset) {
        setSmudgeTimer(prev => ({
          ...prev,
          isPlaying: false,
          timeLeft: data.timeLeft || 180,
          elapsedTime: 0
        }))
      } else {
        setSmudgeTimer(prev => ({
          ...prev,
          isPlaying: !data.isFinished,
          timeLeft: data.timeLeft,
          elapsedTime: data.totalElapsed
        }))
      }
    })

    const huntCleanup = timerWorker.addListener('huntCooldown', (data) => {
      if (data.paused) {
        setHuntCooldownTimer(prev => ({
          ...prev,
          isPlaying: false,
          elapsedTime: data.totalElapsed
        }))
      } else if (data.stopped || data.reset) {
        setHuntCooldownTimer(prev => ({
          ...prev,
          isPlaying: false,
          timeLeft: data.timeLeft || 25,
          elapsedTime: 0
        }))
      } else {
        setHuntCooldownTimer(prev => ({
          ...prev,
          isPlaying: !data.isFinished,
          timeLeft: data.timeLeft,
          elapsedTime: data.totalElapsed
        }))
      }
    })

    return () => {
      smudgeCleanup()
      huntCleanup()
    }
  }, [timerWorker])

  const updateSettings = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const value = useMemo(() => ({
    ghosts,
    setGhosts,
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
    excludedGhosts,
    setExcludedGhosts,
    sortOrder,
    setSortOrder,
    settings,
    setSettings,
    updateSettings,
    isLoading,
    setIsLoading,
    error,
    smudgeTimer,
    setSmudgeTimer,
    huntCooldownTimer,
    setHuntCooldownTimer,
    timerWorker
  }), [
    ghosts,
    selectedEvidence,
    selectedSpeed,
    selectedHuntEvidence,
    selectedSanity,
    searchQuery,
    excludedGhosts,
    sortOrder,
    settings,
    isLoading,
    error,
    smudgeTimer,
    huntCooldownTimer,
    timerWorker
  ])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export default AppContext 