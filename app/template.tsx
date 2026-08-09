import type { ReactNode } from 'react';

export default function Template({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        .hero-avatar {
          background: url('/images/yalcin-mutlu-avatar.webp') 50% 17% / cover no-repeat;
        }

        .hero-avatar > img {
          opacity: 0;
        }
      `}</style>
      {children}
    </>
  );
}
