'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { displayQuestion, importantIds, orderedQuestions, type Question } from './dashboard/data';
import styles from './page.module.css';

function tagFor(question: Question) {
  if (importantIds.has(question.id)) return '⭐ EN ÖNEMLİ';
  if (question.id.startsWith('ek_')) return 'EK SORU';
  if (question.id === 'soru_35' || question.id === 'soru_82') return 'SEN SOR';
  if (['soru_09','soru_10','soru_11','soru_13','soru_14','soru_15','soru_16','ek_154','ek_155'].includes(question.id)) return 'YOLCU';
  if (['soru_19','soru_69','soru_70','soru_71','ek_154','ek_155','ek_156'].includes(question.id)) return 'İŞ ŞARTI';
  if (['soru_25','soru_26','soru_76','soru_78','soru_80','soru_81'].includes(question.id)) return 'DİL';
  return 'MÜLAKAT';
}

export default function StudyDeck() {
  const [index, setIndex] = useState(0);
  const [importantOnly, setImportantOnly] = useState(false);
  const startX = useRef<number | null>(null);
  const activeQuestions = useMemo(() => importantOnly ? orderedQuestions.filter((q) => importantIds.has(q.id)) : orderedQuestions, [importantOnly]);
  const current = activeQuestions[index];
  const progress = useMemo(() => activeQuestions.length ? ((index + 1) / activeQuestions.length) * 100 : 0, [index, activeQuestions.length]);
  const setMode = (important: boolean) => { setImportantOnly(important); setIndex(0); };
  const goNext = () => setIndex((i) => (i + 1) % activeQuestions.length);
  const goPrev = () => setIndex((i) => (i - 1 + activeQuestions.length) % activeQuestions.length);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setIndex((i) => (i + 1) % activeQuestions.length);
      if (event.key === 'ArrowLeft') setIndex((i) => (i - 1 + activeQuestions.length) % activeQuestions.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeQuestions.length]);

  if (!current) return null;
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div><p className={styles.eyebrow}>TRANSDEV • PRÜFPERSONAL • {orderedQuestions.length} SORU</p><h1>Görüşme Çalışması</h1></div>
        <span className={styles.counter}>{index + 1}/{activeQuestions.length}</span>
      </header>
      <div className={styles.modeSwitch} aria-label="Çalışma modu">
        <button className={!importantOnly ? styles.modeActive : ''} onClick={() => setMode(false)}>Tüm Sorular ({orderedQuestions.length})</button>
        <button className={importantOnly ? styles.modeActive : ''} onClick={() => setMode(true)}>⭐ En Önemli ({importantIds.size})</button>
      </div>
      <div className={styles.progressTrack} aria-hidden="true"><div className={styles.progressBar} style={{ width: `${progress}%` }} /></div>
      <section className={styles.stage}
        onTouchStart={(e) => { startX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => { if (startX.current === null) return; const dx = e.changedTouches[0].clientX - startX.current; startX.current = null; if (Math.abs(dx) < 45) return; if (dx < 0) goNext(); else goPrev(); }}>
        <article className={styles.studyCard}>
          <div className={styles.cardHead}><span className={styles.tag}>{tagFor(current)}</span><span className={styles.swipeHint}>{current.id} • ← / →</span></div>
          <div className={styles.questionBlock}><p className={styles.questionLabel}>ALMANCA SORU</p><h2>{displayQuestion(current)}</h2><p className={styles.questionTr}>{current.ceviri}</p></div>
          <div className={`${styles.answerPanel} ${styles.answerVisible}`}><p className={styles.answerLabel}>B1 ALMANCA CEVAP</p><p className={styles.answerDe}>{current.cevap}</p><div className={styles.divider} /><p className={styles.answerLabel}>TÜRKÇESİ</p><p className={styles.answerTr}>{current.anlami}</p></div>
        </article>
      </section>
      <nav className={styles.controls} aria-label="Kart kontrolleri"><button onClick={goPrev} aria-label="Önceki soru">← Önceki</button><button onClick={goNext} aria-label="Sonraki soru">Sonraki →</button></nav>
      <p className={styles.mobileHint}>Sağa kaydır: önceki • Sola kaydır: sonraki</p>
    </main>
  );
}
