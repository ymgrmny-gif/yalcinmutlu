'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  displayQuestion,
  importantIds,
  matchesFilter,
  orderedQuestions,
  searchText,
  type FilterKey,
  type Question,
} from './data';
import styles from './dashboard.module.css';

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: 'important', label: '⭐ En Önemli' },
  { key: 'all', label: 'Tüm Sorular' },
  { key: 'passenger', label: 'Yolcu' },
  { key: 'language', label: 'Dil' },
  { key: 'conditions', label: 'İş Şartları' },
  { key: 'candidate', label: 'Sen Sor' },
];

export default function DashboardClient() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('important');
  const [selectedId, setSelectedId] = useState(orderedQuestions[0]?.id ?? '');
  const [cursor, setCursor] = useState(0);
  const [turkishVisible, setTurkishVisible] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  const visibleQuestions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('de-DE');

    // Search is intentionally global. The filter chips control the idle/list view,
    // but once the user types a query we search all interview questions so terms
    // like "stress" can find matching questions even when "En Önemli" is active.
    if (normalized) {
      return orderedQuestions.filter((question) => searchText(question).includes(normalized));
    }

    return orderedQuestions.filter((question) => matchesFilter(question, filter));
  }, [query, filter]);

  const selected = useMemo(() => {
    return visibleQuestions.find((question) => question.id === selectedId)
      ?? visibleQuestions[0]
      ?? orderedQuestions[0];
  }, [selectedId, visibleQuestions]);

  useEffect(() => {
    if (!visibleQuestions.length) return;
    if (!visibleQuestions.some((question) => question.id === selectedId)) {
      setSelectedId(visibleQuestions[0].id);
      setCursor(0);
    }
  }, [visibleQuestions, selectedId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }
      if (!visibleQuestions.length) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const next = Math.min(cursor + 1, visibleQuestions.length - 1);
        setCursor(next);
        setSelectedId(visibleQuestions[next].id);
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const next = Math.max(cursor - 1, 0);
        setCursor(next);
        setSelectedId(visibleQuestions[next].id);
      }
      if (event.key === 'Enter' && document.activeElement === searchRef.current) {
        event.preventDefault();
        const target = visibleQuestions[cursor] ?? visibleQuestions[0];
        if (target) setSelectedId(target.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cursor, visibleQuestions]);

  const pickQuestion = (question: Question, index: number) => {
    setSelectedId(question.id);
    setCursor(index);
  };

  const changeFilter = (next: FilterKey) => {
    setFilter(next);
    setQuery('');
    setCursor(0);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>TRANSDEV • MÜLAKAT DASHBOARD</p>
          <h1>Hızlı Soru Erişimi</h1>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.emergencyLink} href="/transdev-gorusme/dashboard/acil/">🧯 Acil 15</Link>
          <Link className={styles.studyLink} href="/transdev-gorusme/">Çalışma modu</Link>
        </div>
      </header>

      <section className={styles.searchPanel}>
        <label className={styles.searchLabel} htmlFor="dashboard-search">Duyduğun kelimeyi veya soruyu yaz</label>
        <input
          ref={searchRef}
          id="dashboard-search"
          className={styles.search}
          value={query}
          onChange={(event) => { setQuery(event.target.value); setCursor(0); }}
          placeholder="Örn: stress, gehalt, fahrgast, transdev, deutsch…"
          autoComplete="off"
          autoFocus
        />
        <div className={styles.filterRow}>
          {filters.map((item) => (
            <button
              key={item.key}
              className={filter === item.key ? styles.filterActive : styles.filterButton}
              onClick={() => changeFilter(item.key)}
            >
              {item.label}
              {item.key === 'important' ? ` (${importantIds.size})` : ''}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHead}>
            <strong>{visibleQuestions.length} sonuç</strong>
            <span>↑ ↓ Enter • ESC ara</span>
          </div>
          <div className={styles.questionList}>
            {visibleQuestions.length ? visibleQuestions.map((question, index) => (
              <button
                key={question.id}
                className={selected?.id === question.id ? styles.questionActive : styles.questionButton}
                onClick={() => pickQuestion(question, index)}
              >
                <span className={styles.questionMeta}>
                  {importantIds.has(question.id) ? '⭐ ' : ''}{question.id}
                </span>
                <span className={styles.questionTitle}>{displayQuestion(question)}</span>
                <span className={styles.questionTurkish}>{question.ceviri}</span>
              </button>
            )) : (
              <div className={styles.empty}>Bu aramayla eşleşen soru yok.</div>
            )}
          </div>
        </aside>

        <article className={styles.answerCard}>
          {selected ? (
            <>
              <div className={styles.answerTop}>
                <span className={importantIds.has(selected.id) ? styles.importantBadge : styles.badge}>
                  {importantIds.has(selected.id) ? '⭐ EN ÖNEMLİ' : selected.id}
                </span>
                <button className={styles.languageToggle} onClick={() => setTurkishVisible((value) => !value)}>
                  {turkishVisible ? 'Türkçeyi gizle' : 'Türkçeyi göster'}
                </button>
              </div>

              <p className={styles.sectionLabel}>ALMANCA SORU</p>
              <h2>{displayQuestion(selected)}</h2>
              {turkishVisible && <p className={styles.questionTranslation}>{selected.ceviri}</p>}

              <div className={styles.answerBlock}>
                <p className={styles.sectionLabel}>KISA B1 CEVAP</p>
                <p className={styles.answerGerman}>{selected.cevap}</p>
              </div>

              {turkishVisible && (
                <div className={styles.translationBlock}>
                  <p className={styles.sectionLabel}>TÜRKÇESİ</p>
                  <p className={styles.answerTurkish}>{selected.anlami}</p>
                </div>
              )}

              <details className={styles.keywords}>
                <summary>Eşleşme kelimeleri</summary>
                <div>{selected.keywords.join(' • ')}</div>
              </details>
            </>
          ) : null}
        </article>
      </section>

      <footer className={styles.footer}>
        <span>API yok • tüm soru verisi sayfanın içinde</span>
        <span>Görüşmede: kelimeyi yaz → sonucu seç → cevabı oku</span>
      </footer>
    </main>
  );
}
