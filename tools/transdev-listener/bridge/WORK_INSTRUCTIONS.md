# Transdev Live — ChatGPT Work Bridge

Bu klasörü ChatGPT Desktop > Work içinde yerel klasör olarak aç.

## Görev
`live-question.json` dosyasını izle. `request_id` değiştiğinde:

1. `question_de` alanındaki Almanca görüşme sorusunu oku.
2. Kısa Türkçe anlamını üret.
3. Yalçın Mutlu için 1–3 kısa, doğal, B1 seviyesinde Almanca cevap üret.
4. Deneyim uydurma. Yalnız `truthful_background` içindeki bilgileri kullan.
5. `forbidden_inventions` içindeki hiçbir deneyimi/işvereni kullanma.
6. Cevabı aşağıdaki JSON biçiminde `live-answer.json` dosyasına yaz ve `request_id` değerini aynen kopyala:

```json
{
  "request_id": "live-question.json içindeki değer",
  "translation_tr": "kısa Türkçe anlam",
  "answer_de": "1-3 kısa B1 Almanca cümle"
}
```

## Canlı kullanım davranışı
- `live-question.json` değiştikçe en yeni `request_id` için çalış.
- Eski request_id için cevap yazma.
- Soru henüz tamamlanmamış olsa bile anlam yeterince açıksa kısa bir cevap yaz; soru netleşirse yeni request_id geldiğinde cevabı güncelle.
- Hazır Transdev soruları listener tarafından yerel olarak cevaplanır; bu köprü yalnız eşleşmeyen sorular içindir.
- Gereksiz açıklama, markdown veya not ekleme; yalnız `live-answer.json` dosyasını güncelle.
