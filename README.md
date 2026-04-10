# 2FA Viewer — Online TOTP Code Generator

A free, privacy-first online 2FA authenticator and TOTP code generator. Generates time-based one-time passwords (TOTP) directly in your browser — no server, no tracking, no account required.

**Live Demo:** [https://2fa.aren.work/](https://2fa.aren.work/)

---

## Features

- **Instant TOTP generation** — Paste your 2FA secret key and get a 6-digit code immediately
- **Real-time countdown** — Animated progress ring shows remaining time (30s or 60s periods)
- **Auto-refresh** — New code is generated automatically when the period expires
- **Shareable URL** — Secret key is embedded in the URL path (`https://2fa.aren.work/YOURSECRETKEY`) for quick access
- **One-click copy** — Click the code to copy it to clipboard
- **100% client-side** — All cryptographic operations run in your browser via Web Crypto API
- **No dependencies** — No third-party TOTP libraries, no trackers, no analytics
- **Dark UI** — Clean, minimal dark interface

---

## How It Works

2FA Viewer implements the [RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238) TOTP standard using the browser's native `crypto.subtle` API (HMAC-SHA1). Your secret key never leaves your device.

```
Secret Key (Base32) → HMAC-SHA1 → Dynamic Truncation → 6-digit OTP
```

### Usage

1. Open the app in your browser
2. Paste your 2FA secret key (Base32 format, e.g. `JBSWY3DPEHPK3PXP`)
3. Your current TOTP code appears instantly with a countdown timer
4. Bookmark or share the URL — the key is saved in the path for instant access

---

## URL-based Key Sharing

The secret key is appended to the URL path:

```
https://2fa.aren.work/JBSWY3DPEHPK3PXP
```

Opening this URL directly loads and activates the key automatically — no need to paste it again.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| Crypto | Web Crypto API (`crypto.subtle`, HMAC-SHA1) |
| Styling | Vanilla CSS, SVG progress ring |
| Deploy | GitHub Pages via `main` |
| Dependencies | Zero runtime dependencies |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
git clone https://github.com/buraksahin59/2fa-viewer.git
cd 2fa-viewer
npm install
npm run dev
```

Open `http://localhost:5173`

### Build

```bash
npm run build
```

Outputs to `dist/`. A `404.html` copy is generated automatically for SPA routing on GitHub Pages.

---

## Deploy to GitHub Pages

1. Update `vite.config.js` with your repo name:
   ```js
   const base = '/'   // your repo name
   ```

2. Run:
   ```bash
   git remote add origin https://github.com/buraksahin59/2fa-viewer.git
   npm run deploy
   ```

3. In your GitHub repo: **Settings → Pages → Branch: `main`**

---

## Security & Privacy

- **No server communication** — The app has no backend. Zero requests are made with your key.
- **No storage** — Nothing is saved to localStorage, cookies, or any database.
- **Open source** — All cryptographic logic is visible and auditable in `src/utils/totp.js`.
- **HTTPS required** — Web Crypto API only works over HTTPS (or localhost).

> ⚠️ While the key is in the URL for convenience, avoid sharing the URL on untrusted channels.

---

## Project Structure

```
src/
├── App.jsx            # Main component — state, timer, URL sync
├── App.css            # Dark theme, SVG progress ring styles
└── utils/
    └── totp.js        # RFC 6238 TOTP algorithm (Base32 + HMAC-SHA1)
```

---

## License

MIT
