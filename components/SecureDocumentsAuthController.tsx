'use client';

import { useEffect } from 'react';

type Language = 'tr' | 'en' | 'de';

const copy = {
  tr: {
    sending: 'Erişim doğrulanıyor…',
    invalid: 'Şifre geçersiz veya erişim süresi dolmuş.',
    error: 'Erişim doğrulanamadı. Lütfen tekrar deneyin.',
  },
  en: {
    sending: 'Verifying access…',
    invalid: 'Invalid password or access has expired.',
    error: 'Access could not be verified. Please try again.',
  },
  de: {
    sending: 'Zugriff wird geprüft…',
    invalid: 'Ungültiges Passwort oder der Zugriff ist abgelaufen.',
    error: 'Der Zugriff konnte nicht geprüft werden. Bitte erneut versuchen.',
  },
} as const;

function currentLanguage(): Language {
  const saved = window.sessionStorage.getItem('ym-language');
  return saved === 'de' || saved === 'en' ? saved : 'tr';
}

function statusElement(form: HTMLFormElement) {
  let node = form.querySelector<HTMLElement>('[data-secure-doc-auth-status]');
  if (node) return node;

  node = document.createElement('p');
  node.dataset.secureDocAuthStatus = '1';
  node.setAttribute('role', 'status');
  node.setAttribute('aria-live', 'polite');
  node.style.margin = '0.35rem 0 0';
  node.style.fontSize = '0.9rem';
  node.style.lineHeight = '1.45';
  node.style.color = '#64748b';
  form.appendChild(node);
  return node;
}

export default function SecureDocumentsAuthController() {
  useEffect(() => {
    const onSubmit = async (event: Event) => {
      const form = event.target instanceof HTMLFormElement ? event.target : null;
      if (!form?.classList.contains('secure-modal-form')) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const language = currentLanguage();
      const labels = copy[language];
      const data = new FormData(form);
      const password = String(data.get('password') || '').trim();
      if (!password) return;

      const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      const status = statusElement(form);
      const originalDisabled = submit?.disabled ?? false;
      if (submit) submit.disabled = true;
      status.textContent = labels.sending;
      status.style.color = '#64748b';

      try {
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ action: 'login', password }),
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok || !body?.ok) {
          status.textContent = response.status === 401 ? labels.invalid : labels.error;
          status.style.color = '#b42318';
          return;
        }

        window.sessionStorage.setItem('ym-language', language);
        window.location.href = '/documents/';
      } catch {
        status.textContent = labels.error;
        status.style.color = '#b42318';
      } finally {
        if (submit && document.body.contains(submit)) submit.disabled = originalDisabled;
      }
    };

    document.addEventListener('submit', onSubmit, true);
    return () => document.removeEventListener('submit', onSubmit, true);
  }, []);

  return null;
}
