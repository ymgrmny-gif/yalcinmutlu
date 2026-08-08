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

Tüm tablolarda RLS açıktır ve `anon` / `authenticated` rolleri için doğrudan tablo policy'si yoktur. `yalcinmutlu` şemasının public erişimi kapalıdır.

## Sunucu fonksiyonları

Supabase Edge Function:

`yalcinmutlu-documents`

Service-role erişimi yalnız sunucu tarafında kullanılır.

Kullanılan RPC'ler:

- `public.yalcinmutlu_create_access_user`
- `public.yalcinmutlu_document_login`
- `public.yalcinmutlu_document_session`
- `public.yalcinmutlu_document_list`
- `public.yalcinmutlu_document_logout`

Bu RPC'lerin `anon` ve `authenticated` execute yetkileri kaldırılmıştır; yalnız `service_role` kullanır.

## Cloudflare endpoint

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

## Frontend

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

## Sonraki adımlar

1. Kalıcı erişim kullanıcıları oluşturmak.
2. `yalcinmutlu-private-documents` isimli private storage bucket'ını hazırlamak.
3. CV, diploma ve sertifikaları yüklemek.
4. Belge bazında `document_permissions` atamak.
5. Görüntüleme/indirme için kısa ömürlü signed URL endpoint'i eklemek.
