// Cloudflare Pages Function to refresh access token

export async function onRequestPost(context) {
  try {
    const { refresh_token } = await context.request.json()

    if (!refresh_token) {
      return new Response(JSON.stringify({ error: 'Missing refresh token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const CLIENT_ID = context.env.SPOTIFY_CLIENT_ID
    const CLIENT_SECRET = context.env.SPOTIFY_CLIENT_SECRET

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    })

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Spotify refresh error:', error)
      return new Response(JSON.stringify({ error: 'Failed to refresh token' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in token refresh:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
