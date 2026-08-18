import type { Metadata } from 'next';
import Link from 'next/link';
import { displayQuestion, importantQuestions } from '../data';
import styles from './emergency.module.css';

export const metadata: Metadata = {
  title: 'Transdev Acil 15 | Yalçın Mutlu',
  description: 'JavaScript olmadan okunabilen 15 kritik Transdev mülakat sorusu.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function EmergencyQuestionsPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>TRANSDEV • ACİL YEDEK</p>
          <h1>⭐ En Önemli 15</h1>
          <p>JavaScript gerekmez. Tüm kritik soru ve cevaplar bu sayfada açık.</p>
        </div>
        <Link href="/transdev-gorusme/dashboard/">Dashboard'a dön</Link>
      </header>

      <section className={styles.list}>
        {importantQuestions.map((question, index) => (
          <article className={styles.card} key={question.id}>
            <div className={styles.number}>{String(index + 1).padStart(2, '0')}</div>
            <div>
              <p className={styles.question}>{displayQuestion(question)}</p>
              <p className={styles.questionTr}>{question.ceviri}</p>
              <p className={styles.label}>B1 CEVAP</p>
              <p className={styles.answer}>{question.cevap}</p>
              <p className={styles.answerTr}>{question.anlami}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
