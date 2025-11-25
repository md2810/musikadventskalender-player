import { useState, useEffect } from 'react'
import './App.css'
import NowPlaying from './components/NowPlaying'
import { getSpotifyAuthUrl, handleCallback, getCurrentlyPlaying } from './services/spotify'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for callback
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')

    if (code) {
      handleCallback(code).then(() => {
        setIsAuthenticated(true)
        window.history.replaceState({}, document.title, '/')
      }).catch(err => {
        console.error('Auth error:', err)
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
  }, [])

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
      <div className="app">
        <div className="loading">Lädt...</div>
      </div>
    )
  }

  return (
    <div className="app">
      {!isAuthenticated ? (
        <div className="login-container">
          <button className="login-button" onClick={handleLogin}>
            Mit Spotify anmelden
          </button>
        </div>
      ) : (
        <NowPlaying track={currentTrack} />
      )}
    </div>
  )
}

export default App
