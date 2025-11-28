import { useSettings, defaultSettings } from '../contexts/SettingsContext'
import { useNavigate } from 'react-router-dom'
import './Settings.css'

function Settings() {
  const { settings, updateSetting, resetSettings } = useSettings()
  const navigate = useNavigate()

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <button className="back-button" onClick={() => navigate('/')}>
            &larr; Zurück
          </button>
          <h1>Einstellungen</h1>
          <button className="reset-button" onClick={resetSettings}>
            Zurücksetzen
          </button>
        </div>

        {/* Liquid Glass Section */}
        <section className="settings-section">
          <h2>Liquid Glass Effekt</h2>

          <div className="setting-item">
            <label>
              <span>Hintergrund-Opazität</span>
              <span className="value">{settings.glassOpacity}%</span>
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={settings.glassOpacity}
              onChange={(e) => updateSetting('glassOpacity', Number(e.target.value))}
            />
          </div>

          <div className="setting-item">
            <label>
              <span>Blur-Stärke</span>
              <span className="value">{settings.glassBlur}px</span>
            </label>
            <input
              type="range"
              min="10"
              max="80"
              value={settings.glassBlur}
              onChange={(e) => updateSetting('glassBlur', Number(e.target.value))}
            />
          </div>

          <div className="setting-item">
            <label>
              <span>Glas-Stil</span>
            </label>
            <div className="button-group">
              <button
                className={settings.glassStyle === 'light' ? 'active' : ''}
                onClick={() => updateSetting('glassStyle', 'light')}
              >
                Hell
              </button>
              <button
                className={settings.glassStyle === 'dark' ? 'active' : ''}
                onClick={() => updateSetting('glassStyle', 'dark')}
              >
                Dunkel
              </button>
            </div>
          </div>
        </section>

        {/* Songshow Section */}
        <section className="settings-section">
          <h2>Songshow Modus</h2>

          <div className="setting-item">
            <label>
              <span>Modus</span>
            </label>
            <div className="button-group triple">
              <button
                className={settings.songshowMode === 'off' ? 'active' : ''}
                onClick={() => updateSetting('songshowMode', 'off')}
              >
                Aus
              </button>
              <button
                className={settings.songshowMode === 'timed' ? 'active' : ''}
                onClick={() => updateSetting('songshowMode', 'timed')}
              >
                Zeitgesteuert
              </button>
              <button
                className={settings.songshowMode === 'always' ? 'active' : ''}
                onClick={() => updateSetting('songshowMode', 'always')}
              >
                Immer an
              </button>
            </div>
          </div>

          {settings.songshowMode === 'timed' && (
            <div className="setting-item">
              <label>
                <span>Anzeigedauer</span>
                <span className="value">{settings.songshowDuration} Sek.</span>
              </label>
              <input
                type="range"
                min="2"
                max="15"
                value={settings.songshowDuration}
                onChange={(e) => updateSetting('songshowDuration', Number(e.target.value))}
              />
            </div>
          )}
        </section>

        {/* Slideshow Section */}
        <section className="settings-section">
          <h2>Diashow (AIDS-Seite)</h2>

          <div className="setting-item">
            <label>
              <span>Wechsel-Intervall</span>
              <span className="value">{settings.slideshowInterval} Sek.</span>
            </label>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={settings.slideshowInterval}
              onChange={(e) => updateSetting('slideshowInterval', Number(e.target.value))}
            />
          </div>
        </section>

        {/* Player Section */}
        <section className="settings-section">
          <h2>Player</h2>

          <div className="setting-item">
            <label>
              <span>Breite (minimiert)</span>
              <span className="value">{settings.playerWidth}%</span>
            </label>
            <input
              type="range"
              min="30"
              max="80"
              value={settings.playerWidth}
              onChange={(e) => updateSetting('playerWidth', Number(e.target.value))}
            />
          </div>

          <div className="setting-item">
            <label>
              <span>Fortschrittsbalken anzeigen</span>
            </label>
            <div className="button-group">
              <button
                className={settings.showProgressBar ? 'active' : ''}
                onClick={() => updateSetting('showProgressBar', true)}
              >
                An
              </button>
              <button
                className={!settings.showProgressBar ? 'active' : ''}
                onClick={() => updateSetting('showProgressBar', false)}
              >
                Aus
              </button>
            </div>
          </div>
        </section>

        {/* Zoom Section */}
        <section className="settings-section">
          <h2>Anzeige</h2>

          <div className="setting-item">
            <label>
              <span>Zoom-Stufe</span>
              <span className="value">{settings.zoomLevel}%</span>
            </label>
            <input
              type="range"
              min="50"
              max="150"
              step="10"
              value={settings.zoomLevel}
              onChange={(e) => updateSetting('zoomLevel', Number(e.target.value))}
            />
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section className="settings-section">
          <h2>Tastenkürzel</h2>
          <div className="shortcuts-grid">
            <span className="shortcut-key">+</span>
            <span className="shortcut-desc">Vergrößern</span>

            <span className="shortcut-key">-</span>
            <span className="shortcut-desc">Verkleinern</span>

            <span className="shortcut-key">0</span>
            <span className="shortcut-desc">Zoom zurücksetzen</span>

            <span className="shortcut-key">A</span>
            <span className="shortcut-desc">AIDS-Seite öffnen</span>

            <span className="shortcut-key">S</span>
            <span className="shortcut-desc">Einstellungen öffnen</span>

            <span className="shortcut-key">H</span>
            <span className="shortcut-desc">Startseite öffnen</span>

            <span className="shortcut-key">Esc</span>
            <span className="shortcut-desc">Startseite öffnen</span>
          </div>
        </section>

        {/* Preview */}
        <section className="settings-section preview-section">
          <h2>Vorschau</h2>
          <div
            className="preview-player"
            style={{
              background: settings.glassStyle === 'light'
                ? `rgba(255, 255, 255, ${settings.glassOpacity / 100})`
                : `rgba(0, 0, 0, ${settings.glassOpacity / 100})`,
              backdropFilter: `blur(${settings.glassBlur}px)`,
              WebkitBackdropFilter: `blur(${settings.glassBlur}px)`,
              width: `${settings.playerWidth}%`,
            }}
          >
            <div className="preview-cover"></div>
            <div className="preview-info">
              <div className="preview-title">Beispiel Song</div>
              <div className="preview-artist">Beispiel Künstler</div>
            </div>
            {settings.showProgressBar && <div className="preview-progress"></div>}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Settings
