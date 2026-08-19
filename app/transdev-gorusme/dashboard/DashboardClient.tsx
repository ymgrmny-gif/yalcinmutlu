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

const quickSearches = [
  { label: '🔥 Stress', value: 'stress' },
  { label: '🚆 Fahrgast', value: 'fahrgast' },
  { label: '🎫 Ticket', value: 'ticket' },
  { label: '🧯 Konflikt', value: 'konflikt' },
  { label: '🌙 Schicht', value: 'schicht' },
  { label: '🗣 Deutsch', value: 'deutsch' },
  { label: '💶 Gehalt', value: 'gehalt' },
  { label: '🏢 Transdev', value: 'transdev' },
  { label: '💼 Erfahrung', value: 'erfahrung' },
  { label: '💪 Stärken', value: 'stärken' },
  { label: '🎯 Schwächen', value: 'schwäche' },
  { label: '👤 Vorstellung', value: 'über sich' },
];

const criticalShortcuts = [
  { id: 'soru_01', icon: '👤', label: 'Kendini tanıt' },
  { id: 'soru_02', icon: '🏢', label: 'Neden Transdev?' },
  { id: 'soru_03', icon: '💼', label: 'Deneyim' },
  { id: 'soru_19', icon: '🌙', label: 'Vardiya / Gece' },
  { id: 'soru_20', icon: '🔥', label: 'Stres' },
  { id: 'soru_23', icon: '💪', label: 'Güçlü yönler' },
  { id: 'soru_24', icon: '🎯', label: 'Zayıf yönler' },
  { id: 'soru_28', icon: '✅', label: 'Neden sizi?' },
];

export default function DashboardClient() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('important');
  const [selectedId, setSelectedId] = useState(orderedQuestions[0]?.id ?? '');
  const [cursor, setCursor] = useState(0);
  const [turkishVisible, setTurkishVisible] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  const normalizedQuery = query.trim().toLocaleLowerCase('de-DE');

  const quickCounts = useMemo(() => {
    return Object.fromEntries(
      quickSearches.map((item) => [
        item.value,
        orderedQuestions.filter((question) => searchText(question).includes(item.value.toLocaleLowerCase('de-DE'))).length,
      ])
    ) as Record<string, number>;
  }, []);

  const visibleQuestions = useMemo(() => {
    if (normalizedQuery) {
      return orderedQuestions.filter((question) => searchText(question).includes(normalizedQuery));
    }
    return orderedQuestions.filter((question) => matchesFilter(question, filter));
  }, [normalizedQuery, filter]);

  const selected = useMemo(() => {
    return visibleQuestions.find((question) => question.id === selectedId)
      ?? orderedQuestions.find((question) => question.id === selectedId)
      ?? visibleQuestions[0]
      ?? orderedQuestions[0];
  }, [selectedId, visibleQuestions]);

  useEffect(() => {
    if (!visibleQuestions.length) return;
    if (!visibleQuestions.some((question) => question.id === selectedId) && normalizedQuery) {
      setSelectedId(visibleQuestions[0].id);
      setCursor(0);
    }
  }, [visibleQuestions, selectedId, normalizedQuery]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === '/') {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }
      if (event.key === 'Escape') {
        setQuery('');
        searchRef.current?.focus();
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
    const first = orderedQuestions.find((question) => matchesFilter(question, next));
    if (first) setSelectedId(first.id);
  };

  const runQuickSearch = (value: string) => {
    setQuery(value);
    setCursor(0);
    requestAnimationFrame(() => searchRef.current?.focus());
  };

  const openCritical = (id: string) => {
    setQuery('');
    setFilter('important');
    setSelectedId(id);
    const index = orderedQuestions.filter((question) => importantIds.has(question.id)).findIndex((question) => question.id === id);
    setCursor(Math.max(0, index));
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>TRANSDEV • MÜLAKAT KOKPİTİ • {orderedQuestions.length} SORU</p>
          <h1>Bir bakışta bul, tek dokunuşla aç</h1>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.emergencyLink} href="/transdev-gorusme/dashboard/acil/">🧯 Acil 15</Link>
          <Link className={styles.studyLink} href="/transdev-gorusme/">📚 Çalışma modu</Link>
        </div>
      </header>

      <section className={styles.criticalPanel}>
        <div className={styles.panelHead}>
          <div>
            <span className={styles.panelKicker}>⭐ KRİTİK KISAYOLLAR</span>
            <strong>En çok gelmesi muhtemel sorular</strong>
          </div>
          <span className={styles.keyboardHint}>/ ara • ↑ ↓ seç • Enter aç</span>
        </div>
        <div className={styles.criticalGrid}>
          {criticalShortcuts.map((item) => (
            <button
              key={item.id}
              className={selectedId === item.id && !query ? styles.criticalActive : styles.criticalButton}
              onClick={() => openCritical(item.id)}
            >
              <span className={styles.criticalIcon}>{item.icon}</span>
              <span>{item.label}</span>
              <small>{item.id}</small>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.searchPanel}>
        <div className={styles.searchHead}>
          <label className={styles.searchLabel} htmlFor="dashboard-search">🔎 Duyduğun kelimeyi yaz — tüm {orderedQuestions.length} soruda anında ara</label>
          {query && <button className={styles.clearSearch} onClick={() => setQuery('')}>Temizle ×</button>}
        </div>
        <input
          ref={searchRef}
          id="dashboard-search"
          className={styles.search}
          value={query}
          onChange={(event) => { setQuery(event.target.value); setCursor(0); }}
          placeholder="stress, fahrgast, ticket, schicht, deutsch, gehalt…"
          autoComplete="off"
          autoFocus
        />

        <div className={styles.quickArea}>
          <span className={styles.quickLabel}>⚡ TEK DOKUNUŞ ARAMA</span>
          <div className={styles.quickRow}>
            {quickSearches.map((item) => (
              <button
                key={item.value}
                className={normalizedQuery === item.value.toLocaleLowerCase('de-DE') ? styles.quickActive : styles.quickButton}
                onClick={() => runQuickSearch(item.value)}
              >
                <span>{item.label}</span>
                <b>{quickCounts[item.value] ?? 0}</b>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterArea}>
          <span className={styles.quickLabel}>📂 HAZIR LİSTELER</span>
          <div className={styles.filterRow}>
            {filters.map((item) => (
              <button
                key={item.key}
                className={!query && filter === item.key ? styles.filterActive : styles.filterButton}
                onClick={() => changeFilter(item.key)}
              >
                {item.label}
                {item.key === 'important' ? ` (${importantIds.size})` : ''}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHead}>
            <strong>{visibleQuestions.length} sonuç</strong>
            <span>{query ? `“${query}”` : filter === 'important' ? '⭐ önemli sorular önce' : 'hazır liste'}</span>
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
              <div className={styles.empty}>Bu aramayla eşleşen soru yok. Daha kısa bir kelime dene.</div>
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
                  {turkishVisible ? 'TR açık' : 'TR kapalı'}
                </button>
              </div>

              <p className={styles.sectionLabel}>ALMANCA SORU</p>
              <h2>{displayQuestion(selected)}</h2>
              {turkishVisible && <p className={styles.questionTranslation}>{selected.ceviri}</p>}

              <div className={styles.answerBlock}>
                <p className={styles.sectionLabel}>B1 ALMANCA CEVAP</p>
                <p className={styles.answerGerman}>{selected.cevap}</p>
              </div>

              {turkishVisible && (
                <div className={styles.translationBlock}>
                  <p className={styles.sectionLabel}>TÜRKÇESİ</p>
                  <p className={styles.answerTurkish}>{selected.anlami}</p>
                </div>
              )}

              <details className={styles.keywords}>
                <summary>🔑 Eşleşme kelimeleri</summary>
                <div>{selected.keywords.join(' • ')}</div>
              </details>
            </>
          ) : null}
        </article>
      </section>

      <footer className={styles.footer}>
        <span>⭐ kritik soru → ⚡ konu kısayolu → 🔎 serbest arama</span>
        <span>Amaç: görüşmede en fazla 1–2 dokunuşla doğru cevaba ulaşmak</span>
      </footer>
    </main>
  );
}
