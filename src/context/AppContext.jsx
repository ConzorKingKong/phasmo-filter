import React, { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export const useApp = () => useContext(AppContext)

export const AppProvider = ({ children }) => {
  const [ghosts, setGhosts] = useState([])
  const [selectedEvidence, setSelectedEvidence] = useState({})
  const [selectedSpeed, setSelectedSpeed] = useState({})
  const [selectedHuntEvidence, setSelectedHuntEvidence] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [settings, setSettings] = useState({
    darkMode: true,
    fontSize: 'medium'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGhosts = async () => {
      try {
        const response = await fetch('/data/ghosts.json')
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

  const updateSettings = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const value = {
    ghosts,
    setGhosts,
    selectedEvidence,
    setSelectedEvidence,
    selectedSpeed,
    setSelectedSpeed,
    selectedHuntEvidence,
    setSelectedHuntEvidence,
    searchQuery,
    setSearchQuery,
    settings,
    setSettings,
    updateSettings,
    isLoading,
    setIsLoading,
    error
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export default AppContext 