'use client';

import { useEffect, useState } from 'react';

function findFormByText(text: string) {
  return Array.from(document.querySelectorAll<HTMLFormElement>('form')).find((form) =>
    form.textContent?.includes(text),
  );
}

export default function AdminPasswordEnhancer() {
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const enhanceForms = () => {
      const visitorForm = findFormByText('Yeni ziyaretçi erişimi');
      if (visitorForm) {
        const passwordInput = visitorForm.querySelector<HTMLInputElement>('input[name="password"]');
        if (passwordInput) {
          passwordInput.required = false;
          passwordInput.minLength = 0;
          const field = passwordInput.closest<HTMLElement>('.admin-field');
          if (field) field.style.display = 'none';
        }

        if (!visitorForm.querySelector('[data-auto-password-note]')) {
          const body = visitorForm.querySelector<HTMLElement>('.admin-modal-body');
          const anchor = body?.querySelector('.admin-form-grid');
          if (body && anchor) {
            const note = document.createElement('div');
            note.dataset.autoPasswordNote = 'true';
            note.style.cssText = [
              'margin:4px 0 16px',
              'padding:13px 14px',
              'border:1px solid rgba(18,184,189,.28)',
              'border-radius:11px',
              'background:#edf9f9',
              'color:#17434a',
              'font-size:.79rem',
              'line-height:1.55',
            ].join(';');
            note.innerHTML = '<strong style="display:block;color:#087f84;margin-bottom:3px">6 haneli şifre otomatik oluşturulur</strong>“Erişim oluştur” dediğinde sistem güvenli bir 6 haneli kod üretir ve sana tek seferlik olarak gösterir.';
            anchor.insertAdjacentElement('afterend', note);
          }
        }
      }

      const newPassword = document.querySelector<HTMLInputElement>('input[name="newPassword"]');
      const confirmPassword = document.querySelector<HTMLInputElement>('input[name="confirmPassword"]');
      if (newPassword && confirmPassword) {
        newPassword.minLength = 0;
        confirmPassword.minLength = 0;

        const settingsForm = newPassword.closest<HTMLFormElement>('form');
        const currentPassword = settingsForm?.querySelector<HTMLInputElement>('input[name="currentPassword"]');
        if (currentPassword) {
          currentPassword.required = false;
          const field = currentPassword.closest<HTMLElement>('.admin-field');
          if (field) field.style.display = 'none';
        }

        if (settingsForm && !settingsForm.querySelector('[data-free-password-note]')) {
          const note = document.createElement('div');
          note.dataset.freePasswordNote = 'true';
          note.style.cssText = [
            'margin:0 0 14px',
            'padding:11px 12px',
            'border-radius:9px',
            'background:#edf9f9',
            'color:#40606b',
            'font-size:.76rem',
            'line-height:1.5',
          ].join(';');
          note.innerHTML = '<strong style="color:#087f84">Serbest şifre seçimi:</strong> Sabit 12 karakter zorunluluğu kaldırıldı. Yeni şifren boş olmadığı sürece istediğin uzunluk ve karakterleri kullanabilirsin.';
          settingsForm.insertBefore(note, settingsForm.querySelector('.admin-error, button.admin-primary'));
        }
      }
    };

    enhanceForms();
    const observer = new MutationObserver(enhanceForms);
    observer.observe(document.body, { childList: true, subtree: true });

    const originalFetch = window.fetch.bind(window);
    const patchedFetch: typeof window.fetch = async (input, init) => {
      let action = '';
      try {
        if (typeof init?.body === 'string') {
          const parsed = JSON.parse(init.body) as { action?: string };
          action = String(parsed.action || '');
        }
      } catch {
        action = '';
      }

      const response = await originalFetch(input, init);

      if (action === 'documentUrl' && response.ok) {
        const body = await response.clone().json().catch(() => null) as { url?: unknown } | null;
        if (typeof body?.url === 'string') {
          try {
            const freshUrl = new URL(body.url);
            freshUrl.searchParams.set('cacheNonce', `${Date.now()}-${crypto.randomUUID()}`);
            const freshBody = { ...body, url: freshUrl.toString() };
            return new Response(JSON.stringify(freshBody), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
            });
          } catch {
            // If URL parsing ever fails, fall back to the original response.
          }
        }
      }

      if (action === 'createUser' && response.ok) {
        response.clone().json().then((body) => {
          const code = typeof body?.generatedPassword === 'string' ? body.generatedPassword : '';
          if (/^\d{6}$/.test(code)) {
            setCopied(false);
            setGeneratedPassword(code);
          }
        }).catch(() => undefined);
      }
      return response;
    };

    window.fetch = patchedFetch;
    return () => {
      observer.disconnect();
      window.fetch = originalFetch;
    };
  }, []);

  if (!generatedPassword) return null;

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:200,display:'grid',placeItems:'center',padding:20,background:'rgba(4,12,20,.72)',backdropFilter:'blur(6px)'}}>
      <section style={{width:'min(440px,100%)',border:'1px solid rgba(18,184,189,.3)',borderRadius:20,background:'#fff',boxShadow:'0 30px 90px rgba(0,0,0,.3)',overflow:'hidden'}}>
        <div style={{padding:'22px 24px 14px',background:'linear-gradient(135deg,#081726,#0d2635)',color:'#fff'}}>
          <div style={{fontSize:12,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'#62dfe2'}}>Yeni ziyaretçi erişimi</div>
          <h2 style={{margin:'7px 0 0',fontSize:22}}>6 haneli şifre hazır</h2>
        </div>
        <div style={{padding:24}}>
          <p style={{margin:'0 0 14px',color:'#637486',fontSize:13,lineHeight:1.6}}>Bu kodu ziyaretçiyle paylaşabilirsin. Güvenlik için şifre veritabanında açık metin olarak saklanmaz; bu ekran kapandıktan sonra tekrar gösterilmez.</p>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:78,border:'1px solid #ccebed',borderRadius:14,background:'#f1fbfb',color:'#087f84',fontSize:34,fontWeight:900,letterSpacing:10,fontVariantNumeric:'tabular-nums'}}>{generatedPassword}</div>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:18}}>
            <button type="button" onClick={() => setGeneratedPassword('')} style={{height:42,padding:'0 15px',border:'1px solid #d9e2e7',borderRadius:9,background:'#fff',color:'#506176',fontWeight:800,cursor:'pointer'}}>Kapat</button>
            <button type="button" onClick={copyPassword} style={{height:42,padding:'0 17px',border:0,borderRadius:9,background:'#12b8bd',color:'#fff',fontWeight:850,cursor:'pointer'}}>{copied?'Kopyalandı':'Şifreyi kopyala'}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
