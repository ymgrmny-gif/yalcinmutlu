# Yalçın Mutlu — Güvenli Belgeler

## Kanonik namespace

Bu portföyün güvenli belge sistemi için **tek kanonik PostgreSQL şeması**:

`yalcinmutlu`

Neslihan projesindeki `public.documents`, `public.guest_users`, `public.guest_sessions` veya diğer `public.*` tabloları bu portföy için kullanılmaz.

## Kanonik tablolar

Ziyaretçi erişimi:

- `yalcinmutlu.access_users`
- `yalcinmutlu.access_sessions`
- `yalcinmutlu.documents`
- `yalcinmutlu.document_permissions`
- `yalcinmutlu.access_logs`

Yönetici erişimi:

- `yalcinmutlu.admin_users`
- `yalcinmutlu.admin_sessions`

Tüm tablolarda RLS açıktır. `anon` / `authenticated` rolleri için doğrudan tablo erişimi verilmez; yönetim ve belge işlemleri service-role üzerinden sunucu tarafında yürütülür.

## Ziyaretçi belge sistemi

Supabase Edge Function:

`yalcinmutlu-documents`

Cloudflare same-origin endpoint:

`/api/documents`

Dosya:

`functions/api/documents.js`

Başarılı ziyaretçi girişinde Cloudflare Pages Function aşağıdaki HttpOnly cookie'yi oluşturur:

`ym_secure_documents_session`

Cookie `HttpOnly`, `Secure`, `SameSite=Strict` özelliklerine sahiptir ve en fazla 2 saat geçerlidir.

## Yönetici paneli

Yönetici arayüzü:

`/admin/documents/`

Dosyalar:

- `app/admin/documents/page.tsx`
- `app/admin/documents/admin.css`
- `app/admin/documents/layout.tsx`

Yönetici Cloudflare endpoint'i:

`/api/admin-documents`

Dosya:

`functions/api/admin-documents.js`

Supabase Edge Function:

`yalcinmutlu-admin`

Yönetici oturumu `ym_admin_documents_session` isimli `HttpOnly`, `Secure`, `SameSite=Strict` cookie ile tutulur. Yönetici session token'ı tarayıcı JavaScript'ine verilmez. Oturum süresi 8 saattir.

Panel özellikleri:

- İstatistik kartları ve 14 günlük aktivite grafiği
- Belge listesi, önizleme, aktif/pasif yönetimi ve kalıcı silme
- Private storage alanına PDF/JPG/PNG/WebP yükleme (maks. 20 MB)
- Ziyaretçi erişim şifresi oluşturma ve devre dışı bırakma
- Ziyaretçi şifresi sıfırlama
- Belge bazında görüntüleme ve indirme izni
- Son erişim hareketleri ve başarısız giriş kayıtları
- Yönetici şifresi değiştirme

Dosyalar `yalcinmutlu-private-documents` private bucket'ında tutulur. Yönetici önizlemeleri kısa ömürlü signed URL ile açılır.

## Gizlilik

Bu namespace'teki erişim loglarında IP adresi tutulmaz. Loglanan temel olaylar:

- login
- login_failed
- logout
- list
- view
- download

## Güvenlik sınırları

- `yalcinmutlu` şeması doğrudan public veri kaynağı olarak kullanılmaz.
- Hassas service-role anahtarı tarayıcıya gönderilmez.
- Ziyaretçi ve yönetici oturumları birbirinden ayrı tutulur.
- Yönetici sayfası `noindex` ve `no-store` başlıklarıyla yayınlanır.
- Belge bağlantıları kalıcı public URL değildir.
