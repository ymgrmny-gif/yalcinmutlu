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

`app/documents/page.tsx` açıldığında gerçek sunucu oturumunu doğrular ve yalnız yetkili belge listesini ister.

## Gizlilik

Bu namespace'teki erişim loglarında IP adresi tutulmaz. Loglanan temel olaylar:

- login
- login_failed
- logout
- list
- view
- download

## Storage

Private bucket:

`yalcinmutlu-private-documents`

Belge görüntüleme ve indirme işlemlerinde kısa ömürlü signed URL kullanılır.
