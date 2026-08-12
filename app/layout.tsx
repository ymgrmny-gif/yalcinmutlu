import type { Metadata } from 'next';
import '@fortawesome/fontawesome-svg-core/styles.css';
import 'aos/dist/aos.css';
import './globals.css';
import './refinements.css';
import './signature.css';
import './signature-glow.css';
import './timeline-alignment.css';
import './legacy-cleanup.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import AOSProvider from '@/components/AOSProvider';
import TimelinePrecisionController from '@/components/TimelinePrecisionController';
import ProjectLinksController from '@/components/ProjectLinksController';

config.autoAddCss = false;

const siteUrl = 'https://yalcinmutlu.pages.dev';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Yalçın Mutlu | Persönliches Portfolio',
    template: '%s | Yalçın Mutlu',
  },
  description: 'Persönliches Portfolio von Yalçın Mutlu mit Berufserfahrung, Ausbildung, Kompetenzen und Projekten.',
  applicationName: 'Yalçın Mutlu Portfolio',
  authors: [{ name: 'Yalçın Mutlu' }],
  creator: 'Yalçın Mutlu',
  publisher: 'Yalçın Mutlu',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Yalçın Mutlu Portfolio',
    title: 'Yalçın Mutlu | Persönliches Portfolio',
    description: 'Berufserfahrung, Ausbildung, Kompetenzen und Projekte von Yalçın Mutlu.',
    locale: 'de_DE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yalçın Mutlu | Persönliches Portfolio',
    description: 'Berufserfahrung, Ausbildung, Kompetenzen und Projekte von Yalçın Mutlu.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className="scroll-smooth">
      <body>
        <AOSProvider>{children}</AOSProvider>
        <TimelinePrecisionController />
        <ProjectLinksController />
      </body>
    </html>
  );
}
