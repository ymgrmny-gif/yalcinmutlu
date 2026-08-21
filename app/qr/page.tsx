import type { Metadata } from 'next';
import PortfolioPage from '@/components/PortfolioPage';

export const metadata: Metadata = {
  title: 'Yalçın Mutlu | QR Referans',
  alternates: {
    canonical: 'https://yalcinmutlu.pages.dev/',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function QrEntryPage() {
  return <PortfolioPage />;
}
