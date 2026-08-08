# Mail Akışı Planı

Bu dosya, statik portföy tamamlandıktan sonra kurulacak iletişim ve erişim talebi altyapısının planıdır.

## Hedef mimari

Kullanıcı formu → Cloudflare Pages Function → Supabase → Resend → Yalçın Mutlu e-posta kutusu

## İletişim formu

1. Kullanıcı ad, e-posta, konu ve mesaj alanlarını doldurur.
2. Pages Function isteği sunucu tarafında doğrular.
3. Turnstile ve hız sınırlama ile spam/bot trafiği azaltılır.
4. Mesaj önce Supabase `contact_messages` tablosuna kaydedilir.
5. Resend API üzerinden bildirim e-postası gönderilir.
6. Gönderim sonucu `sent`, `failed` veya `pending` olarak kayda işlenir.
7. Mail servisi geçici olarak hata verse bile mesaj Supabase kaydında kalır ve admin panelinden görülebilir.

## Belge erişim talebi

`Diğer bilgiler için erişim isteyin` akışı iletişim formundan ayrı tutulacaktır. Talepte ad, e-posta, kurum/şirket ve erişim nedeni alınır. Kayıt Supabase'e yazılır ve yöneticiye bildirim e-postası gönderilir. Admin panelinden talep onaylandığında kişiye özel veya süreli belge erişimi oluşturulabilir.

## Güvenlik

- Resend API anahtarı tarayıcıya gönderilmez; yalnız Cloudflare/Supabase server-side secret olarak saklanır.
- Supabase service-role anahtarı istemci koduna yazılmaz.
- Form verileri doğrulanmadan e-posta servisine iletilmez.
- İleride admin panelinde mesaj durumu, tarih ve yanıt takibi gösterilebilir.

## Geçiş notu

Mevcut EmailJS formu statik tasarım aşamasında kalabilir. Supabase ve Pages Functions kurulurken EmailJS kaldırılıp bu server-side akışa geçirilecektir.
