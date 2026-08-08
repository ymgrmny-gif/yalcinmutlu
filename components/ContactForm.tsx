'use client';

import { FormEvent, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons';
import type { Language } from '@/data/siteData';

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'unconfigured';

const copy = {
  tr: {
    aria: 'İletişim formu', name: 'Adınız', email: 'E-posta', subject: 'Konu', message: 'Mesajınız',
    send: 'Mesaj Gönder', sending: 'Gönderiliyor', sent: 'Mesaj gönderildi.', error: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.',
    unconfigured: 'İletişim formu şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
  },
  en: {
    aria: 'Contact form', name: 'Your name', email: 'Email', subject: 'Subject', message: 'Your message',
    send: 'Send Message', sending: 'Sending', sent: 'Message sent.', error: 'Message could not be sent. Please try again.',
    unconfigured: 'The contact form is currently unavailable. Please try again later.',
  },
  de: {
    aria: 'Kontaktformular', name: 'Ihr Name', email: 'E-Mail', subject: 'Betreff', message: 'Ihre Nachricht',
    send: 'Nachricht senden', sending: 'Wird gesendet', sent: 'Nachricht gesendet.', error: 'Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
    unconfigured: 'Das Kontaktformular ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.',
  },
} as const;

export default function ContactForm({ language = 'tr' }: { language?: Language }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const t = copy[language];

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
    <form ref={formRef} onSubmit={handleSubmit} className="grid gap-3" aria-label={t.aria}>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="form-field" name="from_name" placeholder={t.name} required />
        <input className="form-field" type="email" name="reply_to" placeholder={t.email} required />
      </div>
      <input className="form-field" name="subject" placeholder={t.subject} required />
      <textarea className="form-field min-h-32 resize-y" name="message" placeholder={t.message} required />
      <div className="flex flex-wrap items-center gap-3">
        <button className="action-primary" type="submit" disabled={status === 'sending'}>
          <FontAwesomeIcon icon={status === 'sending' ? faSpinner : faPaperPlane} spin={status === 'sending'} />
          {status === 'sending' ? t.sending : t.send}
        </button>
        <p className="text-xs text-slate-500" aria-live="polite">
          {status === 'sent' && t.sent}
          {status === 'error' && t.error}
          {status === 'unconfigured' && t.unconfigured}
        </p>
      </div>
    </form>
  );
}
