'use client';

import { useEffect } from 'react';
import AOS from 'aos';

export default function AOSProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    AOS.init({
      duration: reduceMotion ? 0 : 720,
      easing: 'ease-out-cubic',
      once: true,
      offset: 36,
      disable: reduceMotion,
    });

    const timer = window.setTimeout(() => AOS.refresh(), 120);
    return () => window.clearTimeout(timer);
  }, []);

  return children;
}
