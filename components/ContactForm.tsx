'use client';

import { FormEvent, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons';

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'unconfigured';

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current) return;

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setStatus('unconfigured');
      return;
    }

    setStatus('sending');
    try {
      await emailjs.sendForm(serviceId, templateId, formRef.current, { publicKey });
      formRef.current.reset();
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid gap-3" aria-label="İletişim formu">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="form-field" name="from_name" placeholder="Adınız" required />
        <input className="form-field" type="email" name="reply_to" placeholder="E-posta" required />
      </div>
      <input className="form-field" name="subject" placeholder="Konu" required />
      <textarea className="form-field min-h-32 resize-y" name="message" placeholder="Mesajınız" required />
      <div className="flex flex-wrap items-center gap-3">
        <button className="action-primary" type="submit" disabled={status === 'sending'}>
          <FontAwesomeIcon icon={status === 'sending' ? faSpinner : faPaperPlane} spin={status === 'sending'} />
          {status === 'sending' ? 'Gönderiliyor' : 'Mesaj Gönder'}
        </button>
        <p className="text-xs text-slate-500" aria-live="polite">
          {status === 'sent' && 'Mesaj gönderildi.'}
          {status === 'error' && 'Mesaj gönderilemedi. Lütfen tekrar deneyin.'}
          {status === 'unconfigured' && 'EmailJS ayarları henüz eklenmedi (.env.local).'}
        </p>
      </div>
    </form>
  );
}
