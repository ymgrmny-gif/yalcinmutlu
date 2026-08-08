'use client';

import { useEffect } from 'react';
import AOS from 'aos';

export default function AOSProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    AOS.init({
      duration: reduceMotion ? 0 : 860,
      easing: 'ease-out-cubic',
      once: true,
      offset: 88,
      anchorPlacement: 'top-bottom',
      disable: reduceMotion,
    });

    const refresh = () => AOS.refreshHard();
    const timer = window.setTimeout(refresh, 180);
    window.addEventListener('load', refresh);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('load', refresh);
    };
  }, []);

  return children;
}
