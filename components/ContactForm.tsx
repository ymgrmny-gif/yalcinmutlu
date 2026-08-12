'use client';

import Link from 'next/link';
import { FormEvent, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons';
import type { Language } from '@/data/siteData';

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'unconfigured';

const copy = {
  tr: {
    aria: 'İletişim formu', name: 'Adınız', email: 'E-posta', subject: 'Konu', message: 'Mesajınız',
    send: 'Mesaj Gönder', sending: 'Gönderiliyor', sent: 'Mesaj gönderildi.', error: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.',
    unconfigured: 'İletişim formu şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
    privacy: 'Formu göndererek mesajınızın yanıtlanması amacıyla işlenmesini kabul edersiniz. Gizlilik bilgileri',
  },
  en: {
    aria: 'Contact form', name: 'Your name', email: 'Email', subject: 'Subject', message: 'Your message',
    send: 'Send Message', sending: 'Sending', sent: 'Message sent.', error: 'Message could not be sent. Please try again.',
    unconfigured: 'The contact form is currently unavailable. Please try again later.',
    privacy: 'By submitting the form, you agree that your message may be processed in order to respond. Privacy notice',
  },
  de: {
    aria: 'Kontaktformular', name: 'Ihr Name', email: 'E-Mail', subject: 'Betreff', message: 'Ihre Nachricht',
    send: 'Nachricht senden', sending: 'Wird gesendet', sent: 'Nachricht gesendet.', error: 'Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
    unconfigured: 'Das Kontaktformular ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.',
    privacy: 'Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Nachricht zur Beantwortung zu. Datenschutzhinweis',
  },
} as const;

export default function ContactForm({ language = 'tr' }: { language?: Language }) {
  const formRef = useRef<HTMLFormElement>(null);
  const startedAtRef = useRef(Date.now());
  const [status, setStatus] = useState<Status>('idle');
  const t = copy[language];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current || status === 'sending') return;

    const data = new FormData(formRef.current);
    const payload = {
      name: String(data.get('name') || ''),
      email: String(data.get('email') || ''),
      subject: String(data.get('subject') || ''),
      message: String(data.get('message') || ''),
      language,
      companyWebsite: String(data.get('company_website') || ''),
      startedAt: startedAtRef.current,
    };

    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null) as { code?: string } | null;
        setStatus(result?.code === 'CONFIGURATION_ERROR' ? 'unconfigured' : 'error');
        return;
      }

      formRef.current.reset();
      startedAtRef.current = Date.now();
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid gap-3" aria-label={t.aria}>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company_website">Company website</label>
        <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="form-field" name="name" placeholder={t.name} minLength={2} maxLength={120} autoComplete="name" required />
        <input className="form-field" type="email" name="email" placeholder={t.email} maxLength={254} autoComplete="email" required />
      </div>
      <input className="form-field" name="subject" placeholder={t.subject} minLength={2} maxLength={180} required />
      <textarea className="form-field min-h-32 resize-y" name="message" placeholder={t.message} minLength={10} maxLength={5000} required />
      <p className="text-xs leading-relaxed text-slate-500">
        {t.privacy}: <Link href="/privacy/" className="underline underline-offset-2">/privacy</Link>
      </p>
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
