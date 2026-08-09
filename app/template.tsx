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

        .portrait-rail {
          background: #060a10 url('/images/yalcin-mutlu-side.webp') 52% 18% / cover no-repeat;
        }

        .portrait-rail > img {
          opacity: 0;
        }
      `}</style>
      {children}
    </>
  );
}
