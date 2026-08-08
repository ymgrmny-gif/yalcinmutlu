import type { Metadata } from 'next';
import '@fortawesome/fontawesome-svg-core/styles.css';
import 'aos/dist/aos.css';
import './globals.css';
import './refinements.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import AOSProvider from '@/components/AOSProvider';
import TimelinePrecisionController from '@/components/TimelinePrecisionController';
import ProjectLinksController from '@/components/ProjectLinksController';

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
        <TimelinePrecisionController />
        <ProjectLinksController />
      </body>
    </html>
  );
}
