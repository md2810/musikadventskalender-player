// Cloudflare Pages Function to exchange authorization code for access token

export async function onRequestPost(context) {
  try {
    const { code } = await context.request.json()

    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const CLIENT_ID = context.env.SPOTIFY_CLIENT_ID
    const CLIENT_SECRET = context.env.SPOTIFY_CLIENT_SECRET
    const REDIRECT_URI = context.env.SPOTIFY_REDIRECT_URI

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
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
      console.error('Spotify token error:', error)
      return new Response(JSON.stringify({ error: 'Failed to get token' }), {
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
    console.error('Error in token exchange:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
