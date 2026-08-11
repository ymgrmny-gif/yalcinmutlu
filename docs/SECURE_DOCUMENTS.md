# Yalçın Mutlu — Güvenli Belgeler

## Kanonik namespace

Bu portföyün güvenli belge sistemi için **tek kanonik PostgreSQL şeması**:

`yalcinmutlu`

Neslihan projesindeki `public.documents`, `public.guest_users`, `public.guest_sessions` veya diğer `public.*` tabloları bu portföy için kullanılmaz.

## Kanonik tablolar

- `yalcinmutlu.access_users`
- `yalcinmutlu.access_sessions`
- `yalcinmutlu.documents`
- `yalcinmutlu.document_permissions`
- `yalcinmutlu.access_logs`
- `yalcinmutlu.admin_users`
- `yalcinmutlu.admin_sessions`
- `yalcinmutlu.guest_access_links`
- `yalcinmutlu.guest_access_documents`
- `yalcinmutlu.guest_sessions`

Tüm güvenli tablolarda RLS açıktır ve `anon` / `authenticated` rolleri için doğrudan tablo policy'si yoktur. `yalcinmutlu` şemasının public erişimi kapalıdır.

## Ziyaretçi sunucu fonksiyonu

Supabase Edge Function:

`yalcinmutlu-documents`

Service-role erişimi yalnız sunucu tarafında kullanılır.

Kullanılan RPC'ler arasında:

- `public.yalcinmutlu_create_access_user`
- `public.yalcinmutlu_document_login`
- `public.yalcinmutlu_document_session`
- `public.yalcinmutlu_document_list`
- `public.yalcinmutlu_document_logout`

Bu RPC'lerin `anon` ve `authenticated` execute yetkileri kaldırılmıştır; yalnız `service_role` kullanır.

## Cloudflare ziyaretçi endpoint'i

Aynı origin sunucu endpoint'i:

`/api/documents`

Dosya:

`functions/api/documents.js`

Tarayıcı Supabase session token'ını JavaScript içinde tutmaz. Başarılı girişte Cloudflare Pages Function aşağıdaki HttpOnly cookie'yi oluşturur:

`ym_secure_documents_session`

Cookie özellikleri:

- `HttpOnly`
- `Secure`
- `SameSite=Strict`
- Path: `/api/documents`
- Oturum en fazla 2 saat

## Tek tıklamalı guest access / magic link

Admin, her başvuru veya alıcı için ayrı bir paylaşım bağlantısı oluşturabilir. Yönetim ekranı:

`/admin/documents/guest-access/`

Bağlantı biçimi:

`/access/<TOKEN>`

Ham erişim tokenı 32 byte cryptographically secure random veri kullanılarak üretilir ve URL-safe base64 olarak gösterilir. Ham token yalnız oluşturma sonucunda admin tarayıcısına döner; veritabanına yalnız SHA-256 hash'i yazılır.

Guest akışı:

1. `functions/access/[token].js` token biçimini kontrol eder.
2. `yalcinmutlu-guest-access` Edge Function tokenı SHA-256 ile hash'leyip DB kaydıyla karşılaştırır.
3. Link aktif ve süresi geçmemişse en fazla 2 saatlik ayrı guest session oluşturulur.
4. Cloudflare `ym_guest_documents_session` adlı `HttpOnly`, `Secure`, `SameSite=Lax` cookie oluşturur.
5. Tarayıcı `/documents/` adresine yönlendirilir ve paylaşım tokenı adres çubuğundan temizlenir.
6. `/api/documents` guest session olduğunu algılar ve liste / dosya URL isteklerini guest Edge Function'a yönlendirir.
7. `yalcinmutlu.guest_access_documents` tablosunda bu linke atanmış olmayan document ID'leri server-side reddedilir.

Guest session her istek sırasında hem session kaydını hem bağlı guest-access linkinin `revoked_at` / `expires_at` durumunu tekrar doğrular. Bir link admin tarafından iptal edildiğinde mevcut guest session kayıtları da anında revoke edilir.

Guest erişimi yalnız görüntüleme / indirme içindir. Admin, upload, edit, delete veya başka linkleri yönetme endpoint'leri guest cookie kabul etmez.

Guest link yönetim verileri minimum tutulur:

- `access_count`
- `last_access_at`
- oluşturma / sona erme / iptal zamanları
- seçili belge kimlikleri

IP adresi veya fingerprint kaydedilmez.

## Yönetim paneli

Yönetim ekranı:

`/admin/documents/`

Frontend dosyaları:

- `app/admin/documents/page.tsx`
- `app/admin/documents/admin.css`
- `app/admin/documents/document-edit.css`

Cloudflare yönetim endpoint'i:

`/api/admin-documents`

Dosya:

`functions/api/admin-documents.js`

Supabase Edge Function:

`yalcinmutlu-admin`

Yönetici oturumu ayrı bir HttpOnly cookie ile korunur. Yönetim panelinde belge, kullanıcı, izin ve istatistik yönetimi yapılır.

Guest-link yönetimi mevcut admin cookie'sini kullanır fakat backend işlemleri ayrı `yalcinmutlu-guest-access` Edge Function'ında gerçekleştirilir. Bu fonksiyon admin session'ı server-side doğrulamadan link listeleme, oluşturma veya iptal etme işlemi yapmaz.

### Belge düzenleme

Mevcut belgeler kalem düğmesiyle düzenlenebilir. Her belge için bağımsız olarak:

- kategori,
- Türkçe başlık ve açıklama,
- Almanca başlık ve açıklama,
- İngilizce başlık ve açıklama

güncellenebilir.

PDF/JPG/PNG/WebP dosyasının kendisi de isteğe bağlı olarak yeni bir sürümle değiştirilebilir. Yeni dosya özel bucket'a önce yeni bir path ile yüklenir; veritabanı güncellemesi başarılı olduktan sonra eski dosya silinir. Böylece başarısız güncellemede mevcut dosya mümkün olduğunca korunur.

Belge güncelleme RPC'si:

`public.yalcinmutlu_admin_update_document`

Bu RPC yalnız `service_role` tarafından çalıştırılabilir.

## Frontend ziyaretçi alanı

`components/SecureDocumentsAuthController.tsx` mevcut güvenli giriş modalını yakalar ve şifreyi `/api/documents` endpoint'ine gönderir. Eski `ym-doc-preview` sessionStorage kontrolü artık belge sayfasında kullanılmaz.

`app/documents/page.tsx` açıldığında gerçek sunucu oturumunu doğrular ve yalnız yetkili belge listesini ister. Guest session olduğunda ekran salt-okunur paylaşım bağlamını açıkça gösterir; edit / upload / delete / admin kontrolleri bulunmaz.

## Gizlilik

Bu namespace'teki erişim loglarında IP adresi tutulmaz. Loglanan temel olaylar:

- login
- login_failed
- logout
- list
- view
- download

Guest-link tablosu yalnız kullanım sayısı ve son erişim zamanını tutar; IP/fingerprint saklamaz.

## Storage

Private bucket:

`yalcinmutlu-private-documents`

Belge görüntüleme ve indirme işlemlerinde kısa ömürlü signed URL kullanılır. Guest erişimi de aynı private bucket modelini kullanır; public storage URL oluşturmaz.
