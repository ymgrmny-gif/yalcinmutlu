'use client';

import { useEffect, type ReactNode } from 'react';

export default function Template({ children }: { children: ReactNode }) {
  useEffect(() => {
    let active = true;

    fetch('/images/yalcin-mutlu-side-v2.webp.b64', { cache: 'force-cache' })
      .then((response) => {
        if (!response.ok) throw new Error('Side portrait asset unavailable');
        return response.text();
      })
      .then((encoded) => {
        if (!active) return;
        const rail = document.querySelector<HTMLElement>('.portrait-rail');
        if (!rail) return;
        rail.style.backgroundImage = `url("data:image/webp;base64,${encoded.trim()}")`;
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <style>{`
        .hero-avatar {
          background: url('/images/yalcin-mutlu-avatar.webp') 50% 17% / cover no-repeat;
        }

        .hero-avatar > img {
          opacity: 0;
        }

        .portrait-rail {
          background-color: #060a10;
          background-position: 52% 18%;
          background-size: cover;
          background-repeat: no-repeat;
        }

        .portrait-rail > img {
          opacity: 0;
        }
      `}</style>
      {children}
    </>
  );
}
