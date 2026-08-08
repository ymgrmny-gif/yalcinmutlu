# İletişim Akışı

## Aktif mimari

Kullanıcı formu → Cloudflare Pages Function `/api/contact` → Supabase Edge Function `yalcinmutlu-contact` → Supabase veritabanı → e-posta bildirimi

Mesajların ana kayıt yeri Supabase veritabanıdır. Cloudflare Pages Function yalnızca aynı alan adındaki form isteğini Supabase Edge Function'a proxy eder; Cloudflare tarafında Supabase service key tutulmaz.

## Supabase

Portföy iletişimi, mevcut `neslihan-yuce-mutlu` Supabase projesinde diğer verilerden ayrı tutulur.

**Kanonik iletişim tablosu — değiştirmeyin / başka ad aramayın:**

`public.yalcinmutlu_contact_messages`

Kod, migration, Edge Function ve gelecekteki admin paneli bu tablo adını kullanmalıdır. Eski/genel `contact_messages` adı bu portföy için kullanılmaz.

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

RLS açıktır. `anon` ve `authenticated` rolleri için doğrudan tablo erişimi verilmez. Yazma işlemi yalnız Supabase Edge Function içindeki server-side secret ile yapılır.

## Supabase Edge Function

Aktif fonksiyon:

`yalcinmutlu-contact`

Fonksiyon public form endpoint'i olduğu için JWT doğrulaması kapalıdır; bunun yerine izin verilen site origin'i, JSON content type, payload boyutu, honeypot, minimum form süresi ve alan doğrulamaları fonksiyon içinde kontrol edilir.

Supabase secret/service-role anahtarı tarayıcıya veya Cloudflare'a verilmez. Supabase'in kendi Edge Function runtime'ındaki server-side environment üzerinden kullanılır.

## İletişim formu

1. Kullanıcı ad, e-posta, konu ve mesaj alanlarını doldurur.
2. Form aynı alan adındaki `/api/contact` endpoint'ine JSON gönderir.
3. Cloudflare Pages Function isteğin same-origin ve temel HTTP kontrollerini yapıp Supabase Edge Function'a iletir.
4. Supabase Edge Function bot ve alan doğrulamalarını uygular.
5. Mesaj `public.yalcinmutlu_contact_messages` tablosuna kaydedilir.
6. Veritabanı kaydı başarılı olduktan sonra server-side e-posta bildirimi tetiklenir.
7. Bildirim sağlayıcısı isteği kabul ederse ilgili kayıt `email_notified=true` olarak işaretlenir.

## Cloudflare runtime değişkenleri

Aktif iletişim akışı için Cloudflare'da Supabase secret veya service-role değişkeni gerekmez.

## E-posta bildirimi

Aktif bildirim sağlayıcısı FormSubmit AJAX endpoint'idir ve yalnız Supabase Edge Function tarafından çağrılır. Alıcı e-posta adresi istemci tarafına veya bu public repoya yazılmaz.

FormSubmit ilk kullanımda alıcı adrese tek seferlik aktivasyon/onay e-postası gönderir. Aktivasyon tamamlandıktan sonra yeni iletişim kayıtları otomatik olarak e-posta ile iletilir. E-posta sağlayıcısında sorun olsa bile mesajın Supabase veritabanı kaydı ana kayıt olarak korunur.

İleride istenirse FormSubmit yerine Resend veya EmailJS'e geçilebilir; veritabanı ve form akışı değişmeden kalır.

## Gizlilik

İletişim tablosunda IP adresi saklanmaz. Yalnızca kullanıcının formda verdiği iletişim bilgileri, mesaj içeriği, dil, durum ve zaman bilgileri tutulur.

## Spam koruması

Mevcut Edge Function temel bot kontrolleri içerir. Cloudflare Turnstile sonraki sertleştirme adımı olarak eklenebilir.

## EmailJS

EmailJS mevcut bağımlılıklarda yalnızca geri dönüş seçeneği olarak tutulabilir; aktif form akışı EmailJS kullanmaz.
