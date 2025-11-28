import { useState, useEffect, useRef } from 'react'
import { useSettings } from '../contexts/SettingsContext'
import './NowPlaying.css'

function NowPlaying({ track, forceDisableSongshow = false }) {
  const { settings } = useSettings()
  const [displayedTrack, setDisplayedTrack] = useState(null)
  const [localProgress, setLocalProgress] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [dominantColor, setDominantColor] = useState('rgb(30, 30, 40)')
  const lastUpdateRef = useRef(Date.now())
  const progressRef = useRef(0)
  const canvasRef = useRef(null)
  const lastTrackIdRef = useRef(null)
  const collapseTimerRef = useRef(null)
  const expandTimerRef = useRef(null)

  // Determine if songshow should be disabled
  const isSongshowDisabled = forceDisableSongshow || settings.songshowMode === 'off'
  const isSongshowAlwaysOn = !forceDisableSongshow && settings.songshowMode === 'always'

  // Glass styles based on settings
  const glassBackground = settings.glassStyle === 'light'
    ? `rgba(255, 255, 255, ${settings.glassOpacity / 100})`
    : `rgba(0, 0, 0, ${settings.glassOpacity / 100})`

  const glassBackdrop = `blur(${settings.glassBlur}px) saturate(180%)`

  // Extract dominant color from album art
  const extractColor = (imageUrl) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      canvas.width = 50
      canvas.height = 50
      ctx.drawImage(img, 0, 0, 50, 50)

      try {
        const imageData = ctx.getImageData(0, 0, 50, 50).data
        let r = 0, g = 0, b = 0, count = 0

        for (let i = 0; i < imageData.length; i += 4) {
          r += imageData[i]
          g += imageData[i + 1]
          b += imageData[i + 2]
          count++
        }

        r = Math.floor(r / count)
        g = Math.floor(g / count)
        b = Math.floor(b / count)

        setDominantColor(`rgb(${r}, ${g}, ${b})`)
      } catch (e) {
        console.log('Could not extract color:', e)
      }
    }
    img.src = imageUrl
  }

  // Handle track change
  useEffect(() => {
    if (!track) {
      setDisplayedTrack(null)
      setIsExpanded(isSongshowAlwaysOn)
      lastTrackIdRef.current = null
      return
    }

    // Always update progress
    progressRef.current = track.progressMs
    lastUpdateRef.current = Date.now()

    // Check if this is a NEW song (not just an update)
    if (track.id !== lastTrackIdRef.current) {
      lastTrackIdRef.current = track.id

      // Clear any existing timers
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current)
      }
      if (expandTimerRef.current) {
        clearTimeout(expandTimerRef.current)
      }

      // Set track data immediately (starts in collapsed position)
      setDisplayedTrack(track)
      setLocalProgress(track.progressMs)
      extractColor(track.albumImage)

      // Handle songshow based on mode
      if (isSongshowAlwaysOn) {
        // Always expanded
        setIsExpanded(true)
      } else if (!isSongshowDisabled) {
        // Timed mode
        expandTimerRef.current = setTimeout(() => {
          setIsExpanded(true)
        }, 50)

        collapseTimerRef.current = setTimeout(() => {
          setIsExpanded(false)
        }, settings.songshowDuration * 1000)
      }
    } else {
      // Same track, just update data
      setDisplayedTrack(track)
    }
  }, [track, isSongshowDisabled, isSongshowAlwaysOn, settings.songshowDuration])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current)
      }
      if (expandTimerRef.current) {
        clearTimeout(expandTimerRef.current)
      }
    }
  }, [])

  // Interpolate progress locally
  useEffect(() => {
    if (!displayedTrack || !displayedTrack.isPlaying) return

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastUpdateRef.current
      const newProgress = progressRef.current + elapsed
      setLocalProgress(Math.min(newProgress, displayedTrack.durationMs))
    }, 100)

    return () => clearInterval(interval)
  }, [displayedTrack?.id, displayedTrack?.isPlaying])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Fullscreen error:', err)
      })
    } else {
      document.exitFullscreen()
    }
  }

  const progressPercent = displayedTrack?.durationMs
    ? (localProgress / displayedTrack.durationMs) * 100
    : 0

  // Dynamic styles
  const playerStyle = {
    background: glassBackground,
    backdropFilter: glassBackdrop,
    WebkitBackdropFilter: glassBackdrop,
  }

  const collapsedWidthStyle = {
    width: `${settings.playerWidth}vw`,
  }

  if (!displayedTrack) {
    return (
      <div className="now-playing-container">
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <div
          className="now-playing"
          style={{ ...playerStyle, ...collapsedWidthStyle }}
          onClick={toggleFullscreen}
        >
          <div className="no-track">
            Kein Song wird gerade abgespielt
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Fullscreen background overlay */}
      <div
        className={`fullscreen-backdrop ${isExpanded ? 'visible' : ''}`}
        style={{ backgroundColor: dominantColor }}
      >
        <div
          className="fullscreen-cover-bg"
          style={{ backgroundImage: `url(${displayedTrack.albumImage})` }}
        />
      </div>

      <div className={`now-playing-wrapper ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div
          className={`now-playing ${isExpanded ? 'no-glass' : ''}`}
          style={isExpanded ? {} : { ...playerStyle, ...collapsedWidthStyle }}
          onClick={toggleFullscreen}
        >
          <div className="album-cover">
            <img
              src={displayedTrack.albumImage}
              alt={displayedTrack.album}
            />
          </div>
          <div className="track-info">
            <div className="track-title">{displayedTrack.name}</div>
            <div className="track-artist">{displayedTrack.artist}</div>
          </div>
          {settings.showProgressBar && !isExpanded && (
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default NowPlaying
