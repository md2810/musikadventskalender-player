import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import NowPlaying from './components/NowPlaying'
import Settings from './components/Settings'
import BouncingBadge from './components/BouncingBadge'
import { SettingsProvider, useSettings } from './contexts/SettingsContext'
import { getSpotifyAuthUrl, handleCallback, getCurrentlyPlaying } from './services/spotify'

// Keyboard shortcuts handler
function KeyboardShortcuts() {
  const navigate = useNavigate()
  const location = useLocation()
  const { settings, updateSetting } = useSettings()

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      switch (e.key.toLowerCase()) {
        case 'a':
          if (location.pathname !== '/aids') navigate('/aids')
          break
        case 's':
          if (location.pathname !== '/settings') navigate('/settings')
          break
        case 'h':
        case 'escape':
          if (location.pathname !== '/') navigate('/')
          break
        case '+':
        case '=':
          updateSetting('zoomLevel', Math.min(150, settings.zoomLevel + 10))
          break
        case '-':
          updateSetting('zoomLevel', Math.max(50, settings.zoomLevel - 10))
          break
        case '0':
          updateSetting('zoomLevel', 100)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, location.pathname, settings.zoomLevel, updateSetting])

  return null
}

function Slideshow({ images }) {
  const { settings } = useSettings()
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, settings.slideshowInterval * 1000)

    return () => clearInterval(timer)
  }, [images.length, settings.slideshowInterval])

  return (
    <div className="slideshow-container">
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`slideshow-image ${index === currentIndex ? 'active' : ''}`}
        />
      ))}
    </div>
  )
}

function PlayerPage({ forceDisableSongshow = false, slideshowImages = null }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    // Check for callback
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')

    if (code) {
      // Clear URL immediately to prevent double-submission (preserve pathname)
      window.history.replaceState({}, document.title, location.pathname)

      // Check if we already processed this code
      const processedCode = sessionStorage.getItem('processed_code')
      if (processedCode === code) {
        console.log('Code already processed, skipping')
        const token = localStorage.getItem('spotify_access_token')
        if (token) {
          setIsAuthenticated(true)
        }
        setLoading(false)
        return
      }

      // Mark code as being processed
      sessionStorage.setItem('processed_code', code)

      handleCallback(code).then(() => {
        setIsAuthenticated(true)
        setLoading(false)
      }).catch(err => {
        console.error('Auth error:', err)
        sessionStorage.removeItem('processed_code')
        setLoading(false)
      })
    } else {
      // Check if already authenticated
      const token = localStorage.getItem('spotify_access_token')
      if (token) {
        setIsAuthenticated(true)
      }
      setLoading(false)
    }
  }, [location.pathname])

  useEffect(() => {
    if (!isAuthenticated) return

    // Fetch currently playing track
    const fetchTrack = async () => {
      try {
        const track = await getCurrentlyPlaying()
        setCurrentTrack(track)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching track:', err)
        // Token might be expired
        if (err.status === 401) {
          localStorage.removeItem('spotify_access_token')
          localStorage.removeItem('spotify_refresh_token')
          setIsAuthenticated(false)
        }
        setLoading(false)
      }
    }

    fetchTrack()
    // Poll every second
    const interval = setInterval(fetchTrack, 1000)

    return () => clearInterval(interval)
  }, [isAuthenticated])

  const handleLogin = () => {
    window.location.href = getSpotifyAuthUrl()
  }

  if (loading) {
    return (
      <div className={`app ${slideshowImages ? 'slideshow-bg' : ''}`}>
        {slideshowImages && <Slideshow images={slideshowImages} />}
        <div className="loading">Lädt...</div>
      </div>
    )
  }

  return (
    <div className={`app ${slideshowImages ? 'slideshow-bg' : ''}`}>
      {slideshowImages && <Slideshow images={slideshowImages} />}
      <BouncingBadge />
      {!isAuthenticated ? (
        <div className="login-container">
          <button className="login-button" onClick={handleLogin}>
            Mit Spotify anmelden
          </button>
        </div>
      ) : (
        <NowPlaying track={currentTrack} forceDisableSongshow={forceDisableSongshow} />
      )}
    </div>
  )
}

const AIDS_SLIDESHOW_IMAGES = [
  '/img/welt-aids-tag/1.png',
  '/img/welt-aids-tag/2.png',
  '/img/welt-aids-tag/3.png',
  '/img/welt-aids-tag/4.png',
  '/img/welt-aids-tag/5.png',
  '/img/background.png',
]

// Wrapper to apply zoom level
function ZoomWrapper({ children }) {
  const { settings } = useSettings()

  useEffect(() => {
    document.documentElement.style.fontSize = `${settings.zoomLevel}%`
    return () => {
      document.documentElement.style.fontSize = '100%'
    }
  }, [settings.zoomLevel])

  return children
}

function AppContent() {
  return (
    <>
      <KeyboardShortcuts />
      <ZoomWrapper>
        <Routes>
          <Route path="/" element={<PlayerPage />} />
          <Route
            path="/aids"
            element={
              <PlayerPage
                forceDisableSongshow={true}
                slideshowImages={AIDS_SLIDESHOW_IMAGES}
              />
            }
          />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </ZoomWrapper>
    </>
  )
}

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </SettingsProvider>
  )
}

export default App
