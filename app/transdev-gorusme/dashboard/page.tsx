import type { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Transdev Mülakat Dashboard | Yalçın Mutlu',
  description: 'Transdev görüşmesi sırasında hızlı soru ve cevap erişimi.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function TransdevDashboardPage() {
  return <DashboardClient />;
}
