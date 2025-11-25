// Spotify OAuth Configuration
// Diese Werte müssen in der Umgebung gesetzt werden
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || window.location.origin

const SCOPES = [
  'user-read-currently-playing',
  'user-read-playback-state'
]

// Generate random string for state parameter
function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const values = crypto.getRandomValues(new Uint8Array(length))
  return values.reduce((acc, x) => acc + possible[x % possible.length], '')
}

// Generate code verifier for PKCE
async function generateCodeChallenge(codeVerifier) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(codeVerifier)
  )
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

// Get Spotify authorization URL
export function getSpotifyAuthUrl() {
  const state = generateRandomString(16)
  const codeVerifier = generateRandomString(64)

  // Store code verifier for later use
  localStorage.setItem('code_verifier', codeVerifier)

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state: state,
    scope: SCOPES.join(' '),
  })

  return `https://accounts.spotify.com/authorize?${params.toString()}`
}

// Handle OAuth callback
export async function handleCallback(code) {
  // Exchange code for token using Cloudflare Pages Function
  const response = await fetch('/api/spotify/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Token exchange failed:', response.status, errorText)
    throw new Error(`Failed to exchange code for token: ${response.status} - ${errorText}`)
  }

  const data = await response.json()

  // Store tokens
  localStorage.setItem('spotify_access_token', data.access_token)
  if (data.refresh_token) {
    localStorage.setItem('spotify_refresh_token', data.refresh_token)
  }

  return data
}

// Refresh access token
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('spotify_refresh_token')

  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await fetch('/api/spotify/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh token')
  }

  const data = await response.json()
  localStorage.setItem('spotify_access_token', data.access_token)

  return data.access_token
}

// Get currently playing track
export async function getCurrentlyPlaying() {
  let accessToken = localStorage.getItem('spotify_access_token')

  if (!accessToken) {
    throw new Error('Not authenticated')
  }

  let response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  // If token expired, refresh and retry
  if (response.status === 401) {
    accessToken = await refreshAccessToken()
    response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
  }

  if (response.status === 204 || response.status === 404) {
    // No track currently playing
    return null
  }

  if (!response.ok) {
    const error = new Error('Failed to fetch currently playing')
    error.status = response.status
    throw error
  }

  const data = await response.json()

  if (!data || !data.item) {
    return null
  }

  return {
    id: data.item.id,
    name: data.item.name,
    artist: data.item.artists.map(artist => artist.name).join(', '),
    album: data.item.album.name,
    albumImage: data.item.album.images[0]?.url || '',
    isPlaying: data.is_playing,
    progressMs: data.progress_ms || 0,
    durationMs: data.item.duration_ms || 0,
  }
}
