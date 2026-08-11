import type { Metadata } from 'next';
import AdminPasswordEnhancer from '@/components/AdminPasswordEnhancer';
import AdminGuestAccessShortcut from '@/components/AdminGuestAccessShortcut';
import './admin.css';
import './document-edit.css';

export const metadata: Metadata = {
  title: 'Belge Yönetimi | Yalçın Mutlu',
  description: 'Yalçın Mutlu güvenli belge yönetim paneli',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminDocumentsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}<AdminGuestAccessShortcut/><AdminPasswordEnhancer /></>;
}
