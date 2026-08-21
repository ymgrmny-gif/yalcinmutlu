'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const PHONE_NUMBER = '+4915228245042';
const WHATSAPP_NUMBER = '4915228245042';

export default function WhatsAppProfileLink() {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const phoneRow = Array.from(document.querySelectorAll<HTMLElement>('.profile-detail-item')).find(
      (item) => item.textContent?.includes(PHONE_NUMBER)
    );

    setTarget(phoneRow ?? null);
  }, []);

  if (!target) return null;

  return createPortal(
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      title="WhatsApp"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: '0.55rem',
        fontSize: '1.25em',
        lineHeight: 1,
        color: '#25D366',
      }}
    >
      <FontAwesomeIcon icon={faWhatsapp} />
    </a>,
    target
  );
}
