# Yalçın Mutlu — Kişisel Portföy

Yalçın Mutlu için hazırlanmış tek sayfalık kişisel portföy/CV sitesi. Sol tarafta tek parça sabit portre, sağda içerik paneli ve sayfa kaydırıldıkça boyanan/aktifleşen timeline bulunur.

## Teknolojiler

- Next.js 16.2.11 — App Router
- React 19.2
- Tailwind CSS 3.4.17
- AOS 2.3.4
- EmailJS Browser 4.4.1
- Font Awesome 7 + React FontAwesome
- TypeScript

## Yerel geliştirme

```bash
npm install
npm run dev
```

Ardından `http://localhost:3000` adresini açın.

## Cloudflare Pages

Proje Cloudflare Pages üzerinde **statik Next.js export** olarak çalışacak şekilde hazırlanmıştır.

`next.config.ts` içinde:

- `output: 'export'`
- `images.unoptimized: true`
- `trailingSlash: true`

aktiftir. Build sonunda deploy edilecek klasör `out/` olur.

Cloudflare Pages ayarları:

- Production branch: `main`
- Framework preset: `Next.js (Static HTML Export)`
- Build command: `npx next build`
- Build output directory: `out`
- Root directory: repository root
- Node.js: `.node-version` üzerinden `22.16.0`

Cloudflare Pages Git entegrasyonu kurulduktan sonra `main` branch'indeki her yeni commit production build başlatır. Diğer branch ve pull request'ler preview deployment olarak kullanılabilir.

### EmailJS environment variables

İletişim formunun gerçek e-posta gönderebilmesi için Cloudflare Pages > Settings > Environment variables bölümüne şu değişkenleri ekleyin:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=...
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=...
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=...
```

Bu değerler public/client-side EmailJS yapılandırmasıdır ve Next.js static build sırasında bundle içine alınır. Production ve Preview ortamları için ayrı ayrı girilebilir.

## İçerik düzenleme

Kişisel metinlerin büyük kısmı tek dosyadan yönetilir:

`data/siteData.ts`

Profil fotoğrafı:

`public/images/yalcin-mutlu-profile.png`

## CV butonu

CV dosyasını şuraya ekleyin:

`public/cv/yalcin-mutlu-cv.pdf`

Sonra `data/siteData.ts` içindeki:

```ts
cvHref: ''
```

satırını şöyle değiştirin:

```ts
cvHref: '/cv/yalcin-mutlu-cv.pdf'
```

## Timeline davranışı

Timeline yalnız dekorasyon değildir:

- Profil fotoğrafının merkezinden başlayarak ilk timeline düğümüne kesintisiz bağlanır.
- Scroll ilerledikçe çizgi turkuaz olur.
- Geçilen ikonlar turkuaz dolguya geçer.
- Aktif bölüm ikonu pulse animasyonu alır.
- Henüz gelinmeyen bölümler gri kalır.
- Menüden bir bölüme tıklanınca smooth scroll yapılır.

## Cloudflare özel dosyaları

`public/_headers`, build sırasında `out/_headers` olarak çıkar ve Cloudflare Pages tarafından güvenlik başlıkları için kullanılır.

## Not

Eğitim, deneyim, iletişim ve proje içeriklerinin bir bölümü bilinçli olarak placeholder bırakılmıştır. Sonraki geliştirmeler GitHub üzerinden yapılacaktır.
