# Coolify Deploy Rehberi

## Ön Koşullar
- Coolify kurulu ve çalışıyor (self-hosted veya cloud)
- GitHub reposu public veya Coolify'a GitHub erişimi verilmiş

---

## 1. `vite.config.js` Güncelle

Coolify'da kendi domain kullanacaksanız `base` değerini `/` yapın:

```js
// vite.config.js
const base = '/'   // GitHub Pages için '/2fa-viewer/' idi, Coolify için '/' yap
```

Bu değişikliği commit + push edin:

```bash
git add vite.config.js
git commit -m "chore: set base to / for Coolify deploy"
git push
```

---

## 2. Coolify'da Yeni Proje Oluştur

1. Coolify dashboard → **Projects** → **+ New Project**
2. Proje adı girin → **Create**

---

## 3. Resource Ekle (Static Site)

1. Proje içinde **+ New Resource** tıklayın
2. Source: **GitHub** seçin (ilk kez bağlanıyorsanız OAuth ile authorize edin)
3. Repository: `2fa-viewer` reposunu seçin
4. Branch: `main`
5. **Build Pack: Static** seçin

---

## 4. Build Ayarları

| Alan | Değer |
|---|---|
| **Install Command** | `npm install` |
| **Build Command** | `npm run build` |
| **Start Command** | *(boş bırakın)* |
| **Publish Directory** | `dist` |
| **Watch Paths** | *(boş bırakın)* |
| **Custom Docker Options** | *(boş bırakın)* |
| **Use a Build Server?** | Kapalı bırakın |

> `Publish Directory` alanına `dist` yazmazsanız Coolify build çıktısını bulamaz — en kritik alan budur.

---

## 5. SPA Routing Ayarı (Önemli!)

URL path'e key yazdığı için (`site.com/SECRETKEY`) Nginx'in tüm istekleri `index.html`'e yönlendirmesi gerekiyor.

Coolify'da **Configuration → Nginx Configuration** sekmesine gidin ve şunu ekleyin:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

> Coolify bazı versiyonlarda bunu **"Is SPA?"** toggle'ı ile otomatik yapabilir — varsa açın.

---

## 6. Domain Ekle

1. **Domains** sekmesi → **+ Add Domain**
2. Domain adresinizi girin (örn: `2fa.orneksite.com`)
3. **SSL: Let's Encrypt** seçin → otomatik HTTPS

DNS tarafında:
```
A    2fa.orneksite.com    →    [Coolify sunucu IP]
```

---

## 7. Auto Deploy (GitHub Webhook)

1. Coolify'da resource sayfası → **Configuration** → **Webhooks** sekmesi
2. **Webhook URL**'i kopyalayın
3. GitHub reposu → **Settings → Webhooks → Add webhook**
   - Payload URL: kopyaladığınız URL
   - Content type: `application/json`
   - Events: **Just the push event**
   - **Add webhook**

Artık `main`'e her push'ta Coolify otomatik deploy eder.

---

## 8. İlk Deploy

Coolify dashboard'da **Deploy** butonuna tıklayın → build loglarını izleyin.

Build başarılı olursa domain üzerinden uygulamaya erişebilirsiniz:
```
https://2fa.orneksite.com/SECRETKEY
```

---

## Özet Checklist

- [ ] `vite.config.js` → `base: '/'`
- [ ] Coolify'da Static site resource oluşturuldu
- [ ] Build command: `npm run build`, Publish dir: `dist`
- [ ] SPA routing (try_files / Is SPA toggle) açık
- [ ] Domain + SSL tanımlandı
- [ ] GitHub webhook eklendi
- [ ] İlk deploy başarılı
