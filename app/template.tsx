import type { ReactNode } from 'react';

export default function Template({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        .portrait-rail {
          background: url('/images/yalcin-mutlu-avatar.webp') 50% 18% / cover no-repeat;
        }

        .portrait-rail > img {
          opacity: 0;
        }
      `}</style>
      {children}
    </>
  );
}
