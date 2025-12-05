import { useState, useEffect, useRef } from 'react'
import { useSettings } from '../contexts/SettingsContext'

function BouncingBadge() {
  const { settings } = useSettings()
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isAlt, setIsAlt] = useState(false)
  const velocityRef = useRef({ x: 1, y: 1 })
  const badgeRef = useRef(null)

  // Blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsAlt(prev => !prev)
    }, 500)
    return () => clearInterval(blinkInterval)
  }, [])

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

        // Bounce off walls
        if (newX <= 0 || newX + width >= window.innerWidth) {
          velocityRef.current.x *= -1
          newX = Math.max(0, Math.min(newX, window.innerWidth - width))
        }
        if (newY <= 0 || newY + height >= window.innerHeight) {
          velocityRef.current.y *= -1
          newY = Math.max(0, Math.min(newY, window.innerHeight - height))
        }

        return { x: newX, y: newY }
      })
    }

    const intervalId = setInterval(animate, 16) // ~60fps
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div
      ref={badgeRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        padding: '20px 30px',
        borderRadius: '20px',
        backgroundColor: isAlt ? 'yellow' : 'red',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxSizing: 'border-box',
        zIndex: 9999,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        transition: 'background-color 0.15s ease',
      }}
    >
      <span
        style={{
          color: isAlt ? 'red' : 'yellow',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          lineHeight: 1.3,
          whiteSpace: 'nowrap',
          transition: 'color 0.15s ease',
        }}
      >
        {settings.badgeText}
      </span>
    </div>
  )
}

export default BouncingBadge
