import type { Metadata } from 'next';
import '@fortawesome/fontawesome-svg-core/styles.css';
import 'aos/dist/aos.css';
import './globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import AOSProvider from '@/components/AOSProvider';

config.autoAddCss = false;

export const metadata: Metadata = {
  title: 'Yalçın Mutlu | Kişisel Portföy',
  description: 'Yalçın Mutlu kişisel portföy, CV, deneyim ve proje sayfası.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body>
        <AOSProvider>{children}</AOSProvider>
      </body>
    </html>
  );
}
