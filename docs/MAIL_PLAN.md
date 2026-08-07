# E-posta gönderim planı

Statik aşamada form arayüzü korunur. Üretim aşamasında tarayıcıdan doğrudan e-posta servisine gizli anahtar gönderilmeyecek.

Önerilen akış:

1. Ziyaretçi iletişim formunu doldurur.
2. Form isteği Cloudflare Pages Function `/api/contact` uç noktasına gider.
3. Pages Function alanları doğrular, basit rate-limit / spam kontrollerini uygular ve isteğe sunucu tarafında bir kimlik verir.
4. Pages Function Supabase Edge Function `portfolio-contact` çağrısını yapar.
5. Edge Function mesajı Supabase `contact_messages` tablosuna kaydeder ve e-posta sağlayıcısına sunucu tarafında istek gönderir.
6. İlk tercih Resend; gerekirse SMTP uyumlu başka sağlayıcıya geçilebilir. API anahtarı yalnız Supabase/Cloudflare secret olarak saklanır.
7. Başarılı gönderimde ziyaretçiye yalnız genel başarı cevabı döner; servis anahtarı veya iç hata ayrıntısı dönmez.
8. Admin paneli mesajların durumunu `new / sent / failed / archived` olarak gösterebilir.

Güvenlik ve gizlilik:

- API anahtarları `NEXT_PUBLIC_*` değişkenlerine konmaz.
- Form uç noktası IP bazlı kaba rate-limit ve honeypot alanı kullanır.
- Mesaj içeriği yalnız iletişim amacıyla saklanır; belge erişim loglarından ayrı tabloda tutulur.
- E-posta gönderim hataları kişisel veri içermeyen teknik loglarla izlenir.
- Üç dil için konu ve otomatik yanıt şablonları TR / EN / DE olarak hazırlanır.

Geçiş planı: Supabase/admin panel aşamasına kadar mevcut EmailJS kodu çalışabilir; production backend kurulduğunda EmailJS istemci çağrısı kaldırılıp `/api/contact` kullanılır.
