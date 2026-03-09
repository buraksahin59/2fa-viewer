# 2FA Viewer — Proje Notları

## Genel Bakış
RFC 6238 tabanlı TOTP (Time-based One-Time Password) kod görüntüleyici.
Tamamen client-side çalışır, hiçbir şey sunucuya gönderilmez.

## Teknoloji
- **React + Vite** (template: react)
- Dış kütüphane yok — TOTP için Web Crypto API kullanılıyor
- Deploy: `gh-pages` paketi

## Proje Yapısı
```
src/
├── main.jsx           # React entry point
├── index.css          # Global reset
├── App.jsx            # Ana bileşen (state, timer, URL sync)
├── App.css            # Dark tema, SVG progress ring stilleri
└── utils/
    └── totp.js        # TOTP algoritması (Base32 decode + HMAC-SHA1)
.claude/
└── launch.json        # Preview sunucu config (port 5173)
```

## Özellikler
- 2FA secret key girişi → 6 haneli TOTP kodu üretimi
- 30s / 60s geri sayım (SVG dairesel progress ring)
- Periyot bitince otomatik kod yenileme
- 5 saniye kaldığında ring kırmızıya döner (urgency state)
- Koda tıklayınca panoya kopyalanır
- Key otomatik olarak URL path'e eklenir: `site.com/SECRETKEY`
- URL'e direkt girilince key otomatik yüklenir

## TOTP Algoritması (`src/utils/totp.js`)
RFC 6238 implementasyonu:
1. `base32Decode(secret)` → `Uint8Array`
2. `counter = floor(unixTime / period)` → 8 byte big-endian
3. `HMAC-SHA1(keyBytes, counterBytes)` via `crypto.subtle`
4. Dynamic truncation → `% 1_000_000` → 6 haneli zero-padded string

## URL Routing
React Router kullanılmaz. `import.meta.env.BASE_URL` + `window` API:
```js
// Okuma (mount) — base path çıkarılır
const base = import.meta.env.BASE_URL // '/' veya '/2fa-viewer/'
const key = window.location.pathname.slice(base.length)

// Yazma (key değişince)
window.history.replaceState({}, '', `${base}${key}`)
```

## Geliştirme
```bash
npm run dev     # localhost:5173
npm run build   # dist/ klasörüne çıktı (+ 404.html kopyası)
npm run preview # build önizleme
```

## GitHub Pages Deploy
`vite.config.js` içinde `base` değişkenini repo adıyla güncelleyin:
```js
const base = '/REPO-ADINIZ/'   // örn: '/2fa-viewer/'
```
Ardından:
```bash
git init
git remote add origin https://github.com/KULLANICI/REPO.git
npm run deploy   # build + gh-pages branch'e push
```
GitHub repo Settings → Pages → Branch: `gh-pages` seçin.
URL: `https://KULLANICI.github.io/2fa-viewer/SECRETKEY`

## Diğer Deploy Seçenekleri
- **Netlify/Vercel**: `base: '/'` yap, direkt `dist/` klasörünü deploy et
- **Nginx**: `try_files $uri /index.html;` + `base: '/'`
