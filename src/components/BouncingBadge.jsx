import { useState, useEffect, useRef, useMemo } from 'react'
import { useSettings } from '../contexts/SettingsContext'

function BouncingBadge({ track }) {
  const { settings } = useSettings()
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isAlt, setIsAlt] = useState(false)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [bounceScale, setBounceScale] = useState({ x: 1, y: 1 })
  const [trail, setTrail] = useState([])
  const velocityRef = useRef({ x: 1, y: 1 })
  const badgeRef = useRef(null)

  // Calculate beat interval from BPM
  const beatInterval = useMemo(() => {
    if (settings.badgeBeatSync && track?.tempo && track?.isPlaying) {
      // Convert BPM to milliseconds per beat
      return Math.round(60000 / track.tempo)
    }
    return null
  }, [track?.tempo, track?.isPlaying, settings.badgeBeatSync])

  // Blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsAlt(prev => !prev)
    }, settings.badgeBlinkSpeed)
    return () => clearInterval(blinkInterval)
  }, [settings.badgeBlinkSpeed])

  // Pulse effect - synced to beat if available
  useEffect(() => {
    if (!settings.badgePulse) {
      setScale(1)
      return
    }

    // Use beat interval if beat sync is enabled and we have BPM
    const interval = beatInterval || 600

    const pulseInterval = setInterval(() => {
      setScale(1.12) // Expand
      setTimeout(() => setScale(1), interval * 0.3) // Contract after 30% of beat
    }, interval)

    return () => clearInterval(pulseInterval)
  }, [settings.badgePulse, beatInterval])

  // Update velocity direction when speed changes
  useEffect(() => {
    const speed = settings.badgeSpeed
    velocityRef.current = {
      x: Math.sign(velocityRef.current.x) * speed,
      y: Math.sign(velocityRef.current.y) * speed,
    }
  }, [settings.badgeSpeed])

  useEffect(() => {
    const animate = () => {
      setPosition(prev => {
        const badge = badgeRef.current
        if (!badge) return prev

        const badgeRect = badge.getBoundingClientRect()
        const width = badgeRect.width
        const height = badgeRect.height

        let newX = prev.x + velocityRef.current.x
        let newY = prev.y + velocityRef.current.y

        let hitX = false
        let hitY = false

        // Bounce off walls
        if (newX <= 0 || newX + width >= window.innerWidth) {
          velocityRef.current.x *= -1
          newX = Math.max(0, Math.min(newX, window.innerWidth - width))
          hitX = true
        }
        if (newY <= 0 || newY + height >= window.innerHeight) {
          velocityRef.current.y *= -1
          newY = Math.max(0, Math.min(newY, window.innerHeight - height))
          hitY = true
        }

        // Bounce squash effect
        if (settings.badgeBounceEffect && (hitX || hitY)) {
          setBounceScale({
            x: hitX ? 0.8 : 1.2,
            y: hitY ? 0.8 : 1.2,
          })
          setTimeout(() => setBounceScale({ x: 1, y: 1 }), 150)
        }

        // Rotation based on movement
        if (settings.badgeRotation) {
          setRotation(r => r + velocityRef.current.x * 0.5)
        }

        return { x: newX, y: newY }
      })

      // Update trail
      if (settings.badgeTrail) {
        setTrail(prev => {
          const newTrail = [...prev, { ...position, id: Date.now() }]
          return newTrail.slice(-8) // Keep last 8 positions
        })
      }
    }

    const intervalId = setInterval(animate, 16) // ~60fps
    return () => clearInterval(intervalId)
  }, [settings.badgeRotation, settings.badgeBounceEffect, settings.badgeTrail, position])

  // Clear trail when disabled
  useEffect(() => {
    if (!settings.badgeTrail) {
      setTrail([])
    }
  }, [settings.badgeTrail])

  if (!settings.badgeEnabled) {
    return null
  }

  const sizeMultiplier = settings.badgeSize / 100
  const bgColor = isAlt ? settings.badgeColor2 : settings.badgeColor1
  const textColor = isAlt ? settings.badgeColor1 : settings.badgeColor2

  const glowStyle = settings.badgeGlow ? {
    boxShadow: `0 4px 15px rgba(0, 0, 0, 0.4), 0 0 20px ${bgColor}50`,
  } : {
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
  }

  return (
    <>
      {/* Beat sync indicator */}
      {settings.badgeBeatSync && beatInterval && (
        <div
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: '#0f0',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 10000,
          }}
        >
          {Math.round(track.tempo)} BPM
        </div>
      )}

      {/* Trail effect */}
      {settings.badgeTrail && trail.map((pos, index) => (
        <div
          key={pos.id}
          style={{
            position: 'fixed',
            left: pos.x,
            top: pos.y,
            padding: `${20 * sizeMultiplier}px ${30 * sizeMultiplier}px`,
            borderRadius: '20px',
            backgroundColor: bgColor,
            opacity: (index + 1) / trail.length * 0.3,
            transform: `scale(${(index + 1) / trail.length * 0.8})`,
            pointerEvents: 'none',
            zIndex: 9998,
          }}
        />
      ))}

      {/* Main badge */}
      <div
        ref={badgeRef}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          padding: `${20 * sizeMultiplier}px ${30 * sizeMultiplier}px`,
          borderRadius: '20px',
          backgroundColor: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          boxSizing: 'border-box',
          zIndex: 9999,
          ...glowStyle,
          transform: `
            rotate(${settings.badgeRotation ? rotation : 0}deg)
            scale(${scale * bounceScale.x}, ${scale * bounceScale.y})
          `,
          transition: `
            background-color ${settings.badgeBlinkSpeed / 3}ms ease,
            transform 0.1s ease-out
          `,
        }}
      >
        <span
          style={{
            color: textColor,
            fontWeight: 'bold',
            fontSize: `${1.2 * sizeMultiplier}rem`,
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            transition: `color ${settings.badgeBlinkSpeed / 3}ms ease`,
            textShadow: settings.badgeGlow ? `0 0 8px ${textColor}80` : 'none',
          }}
        >
          {settings.badgeText}
        </span>
      </div>
    </>
  )
}

export default BouncingBadge
