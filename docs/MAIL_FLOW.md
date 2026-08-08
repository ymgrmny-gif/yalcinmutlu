# İletişim Akışı

## Aktif mimari

Kullanıcı formu → Cloudflare Pages Function `/api/contact` → Supabase → isteğe bağlı Resend bildirimi

Mesajların ana kayıt yeri Supabase veritabanıdır. E-posta bildirimi yardımcı kanaldır; bildirim servisi geçici olarak hata verse bile başarılı veritabanı kaydı kaybolmaz.

## Supabase

Portföy iletişimi, mevcut `neslihan-yuce-mutlu` Supabase projesinde diğer verilerden ayrı tutulur.

**Kanonik iletişim tablosu — değiştirmeyin / başka ad aramayın:**

`public.yalcinmutlu_contact_messages`

Kod, migration, Cloudflare Function ve gelecekteki admin paneli bu tablo adını kullanmalıdır. Eski/genel `contact_messages` adı bu portföy için kullanılmaz.

Alanlar:
- `id`
- `name`
- `email`
- `subject`
- `message`
- `language`
- `status`
- `email_notified`
- `created_at`
- `updated_at`

RLS açıktır. `anon` ve `authenticated` rolleri için doğrudan tablo erişimi verilmez. Yazma işlemi yalnız Cloudflare Pages Function içindeki server-side Supabase service-role secret ile yapılır.

## İletişim formu

1. Kullanıcı ad, e-posta, konu ve mesaj alanlarını doldurur.
2. Form aynı alan adındaki `/api/contact` endpoint'ine JSON gönderir.
3. Endpoint same-origin, content type, payload boyutu, honeypot, minimum form süresi ve alan doğrulamalarını kontrol eder.
4. Mesaj `yalcinmutlu_contact_messages` tablosuna kaydedilir.
5. Resend ayarlanmışsa bildirim e-postası gönderilir.
6. Bildirim başarılı olduğunda `email_notified=true` olarak işaretlenir.

## Cloudflare runtime değişkenleri

Zorunlu:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

E-posta bildirimi için isteğe bağlı:

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`

Service-role ve mail API anahtarları hiçbir zaman GitHub'a veya istemci tarafı JavaScript'e yazılmaz.

## Gizlilik

İletişim tablosunda IP adresi saklanmaz. Yalnızca kullanıcının formda verdiği iletişim bilgileri, mesaj içeriği, dil, durum ve zaman bilgileri tutulur.

## Spam koruması

Mevcut endpoint temel bot kontrolleri içerir. Cloudflare Turnstile sonraki sertleştirme adımı olarak eklenebilir. Turnstile secret istemci tarafına verilmez.

## EmailJS

EmailJS mevcut bağımlılıklarda yalnızca olası geri dönüş seçeneği olarak tutulabilir; aktif form akışı EmailJS kullanmaz.
