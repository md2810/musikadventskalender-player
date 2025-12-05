import { createContext, useContext, useState, useEffect } from 'react'

const defaultSettings = {
  // Liquid Glass
  glassOpacity: 25,
  glassBlur: 40,

  // Slideshow
  slideshowInterval: 15,

  // Songshow Mode: 'off' | 'timed' | 'always'
  songshowMode: 'timed',
  songshowDuration: 4,

  // Player
  playerWidth: 50,
  showProgressBar: true,

  // Theme
  glassStyle: 'light', // 'light' | 'dark'

  // Zoom
  zoomLevel: 100, // 50-150%

  // Bouncing Badge
  badgeEnabled: true,
  badgeSpeed: 3, // 1-10
  badgeText: 'Letzter Tag - Nur noch wenige Tickets verfügbar',
  badgeSize: 100, // 50-150%
  badgeBlinkSpeed: 500, // 200-1000ms
  badgeColor1: '#ff0000', // red
  badgeColor2: '#ffff00', // yellow
  // Visual effects
  badgeRotation: false,
  badgePulse: true,
  badgeTrail: true,
  badgeGlow: true,
  badgeBounceEffect: true,
  badgeBeatSync: true, // Sync pulse to song BPM
}

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('musikadventskalender_settings')
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) }
      } catch {
        return defaultSettings
      }
    }
    return defaultSettings
  })

  useEffect(() => {
    localStorage.setItem('musikadventskalender_settings', JSON.stringify(settings))
  }, [settings])

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export { defaultSettings }
