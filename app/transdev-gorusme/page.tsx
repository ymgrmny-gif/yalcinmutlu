import type { Metadata } from 'next';
import StudyDeck from './StudyDeck';

export const metadata: Metadata = {
  title: 'Transdev Görüşme Çalışması | Yalçın Mutlu',
  description: 'Transdev Prüfpersonal Tübingen için kısa B1 Almanca mülakat çalışma sayfası.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function TransdevInterviewPage() {
  return <StudyDeck />;
}
