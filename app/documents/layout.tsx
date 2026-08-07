import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Güvenli Belgeler | Yalçın Mutlu',
  robots: { index: false, follow: false, nocache: true },
};

export default function DocumentsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
