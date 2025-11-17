import './NowPlaying.css'

function NowPlaying({ track }) {
  if (!track) {
    return (
      <div className="now-playing-container">
        <div className="now-playing">
          <div className="no-track">
            Kein Song wird gerade abgespielt
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="now-playing-container">
      <div className="now-playing">
        <div className="album-cover">
          <img
            src={track.albumImage}
            alt={track.album}
          />
        </div>
        <div className="track-info">
          <div className="track-title">{track.name}</div>
          <div className="track-artist">{track.artist}</div>
        </div>
      </div>
    </div>
  )
}

export default NowPlaying
