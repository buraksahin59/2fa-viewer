import { useState, useEffect, useCallback, useRef } from 'react'
import { generateTOTP, getTimeLeft, base32Decode } from './utils/totp'
import './App.css'

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function App() {
  const [secretKey, setSecretKey] = useState('')
  const [code, setCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(30)
  const [period, setPeriod] = useState(30)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const inputRef = useRef(null)

  // URL'den key oku (mount) — base path'i çıkar
  useEffect(() => {
    const base = import.meta.env.BASE_URL // '/' veya '/2fa-viewer/'
    const pathKey = window.location.pathname.slice(base.length)
    if (pathKey) {
      setSecretKey(pathKey.toUpperCase())
    }
  }, [])

  // Kod üret
  const refreshCode = useCallback(async (key, p) => {
    if (!key) { setCode(''); return }
    try {
      base32Decode(key) // validation
      const newCode = await generateTOTP(key, p)
      setCode(newCode)
      setError('')
    } catch {
      setCode('')
      setError('Geçersiz 2FA key. Base32 formatı bekleniyor.')
    }
  }, [])

  // Key değişince URL güncelle + kod üret
  useEffect(() => {
    const clean = secretKey.trim()
    const base = import.meta.env.BASE_URL
    if (clean) {
      window.history.replaceState({}, '', `${base}${clean}`)
      refreshCode(clean, period)
    } else {
      window.history.replaceState({}, '', base)
      setCode('')
      setError('')
    }
  }, [secretKey, period, refreshCode])

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      const left = getTimeLeft(period)
      setTimeLeft(left)
      if (left === period) {
        const clean = secretKey.trim()
        if (clean) refreshCode(clean, period)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [secretKey, period, refreshCode])

  // İlk yüklemede timeLeft senkronize et
  useEffect(() => {
    setTimeLeft(getTimeLeft(period))
  }, [period])

  const handleCopy = () => {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleKeyChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z2-7= ]/g, '')
    setSecretKey(val)
  }

  const progress = timeLeft / period
  const dashOffset = CIRCUMFERENCE * (1 - progress)
  const urgency = timeLeft <= 5

  return (
    <div className="container">
      <header className="header">
        <div className="logo-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
          </svg>
        </div>
        <h1 className="title">2FA Viewer</h1>
      </header>

      <main className="card">
        <div className="input-section">
          <label className="label" htmlFor="secret">2FA Secret Key</label>
          <input
            ref={inputRef}
            id="secret"
            className={`input ${error ? 'input-error' : ''}`}
            type="text"
            value={secretKey}
            onChange={handleKeyChange}
            placeholder="Örn: JBSWY3DPEHPK3PXP"
            spellCheck={false}
            autoComplete="off"
          />
          {error && <p className="error-msg">{error}</p>}
        </div>

        {code && (
          <div className="output-section">
            <div className="timer-row">
              <svg className="ring" width="128" height="128" viewBox="0 0 128 128">
                <circle className="ring-bg" cx="64" cy="64" r={RADIUS} />
                <circle
                  className={`ring-fill ${urgency ? 'ring-urgent' : ''}`}
                  cx="64"
                  cy="64"
                  r={RADIUS}
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                />
                <text x="64" y="58" className="ring-count" textAnchor="middle">{timeLeft}</text>
                <text x="64" y="76" className="ring-label" textAnchor="middle">saniye</text>
              </svg>

              <div className="code-block" onClick={handleCopy} title="Kopyalamak için tıkla">
                <span className="code-text">{code.slice(0, 3)} {code.slice(3)}</span>
                <span className="copy-hint">{copied ? '✓ Kopyalandı' : 'Kopyala'}</span>
              </div>
            </div>

            <div className="period-row">
              <span className="period-label">Periyot:</span>
              <button
                className={`period-btn ${period === 30 ? 'active' : ''}`}
                onClick={() => setPeriod(30)}
              >30s</button>
              <button
                className={`period-btn ${period === 60 ? 'active' : ''}`}
                onClick={() => setPeriod(60)}
              >60s</button>
            </div>
          </div>
        )}

        {!code && !error && !secretKey && (
          <div className="empty-state">
            <p>Yukarıya 2FA secret key'inizi girin.</p>
            <p className="empty-hint">Key otomatik olarak URL'e eklenir — paylaşabilirsiniz.</p>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Tüm işlemler tarayıcınızda gerçekleşir. Key hiçbir sunucuya gönderilmez.</p>
      </footer>
    </div>
  )
}
