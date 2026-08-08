'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowUpRightFromSquare, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import type { Language, LocalizedText } from '@/data/siteData';
import { siteData } from '@/data/siteData';

const l = (tr: string, en: string, de: string): LocalizedText => ({ tr, en, de });
const text = (value: LocalizedText, language: Language) => value[language];

const copy = {
  tr: {
    pageTitle: 'Projeler | Yalçın Mutlu',
    languageSelector: 'Dil seçimi',
    back: 'Portföye dön',
    eyebrow: 'Seçilmiş çalışmalar',
    title: 'Proje Detayları',
    intro: 'Projelerin amacı, çalışma yaklaşımı ve öne çıkan özellikleri.',
    highlights: 'Öne çıkanlar',
    liveApp: 'Canlı uygulamayı aç',
  },
  en: {
    pageTitle: 'Projects | Yalçın Mutlu',
    languageSelector: 'Language selector',
    back: 'Back to portfolio',
    eyebrow: 'Selected work',
    title: 'Project Details',
    intro: 'Project goals, working approach and key features.',
    highlights: 'Highlights',
    liveApp: 'Open live application',
  },
  de: {
    pageTitle: 'Projekte | Yalçın Mutlu',
    languageSelector: 'Sprachauswahl',
    back: 'Zurück zum Portfolio',
    eyebrow: 'Ausgewählte Arbeiten',
    title: 'Projektdetails',
    intro: 'Ziele, Arbeitsweise und zentrale Merkmale der Projekte.',
    highlights: 'Schwerpunkte',
    liveApp: 'Live-Anwendung öffnen',
  },
} as const;

const projectExtras: Record<string, { highlights: LocalizedText[]; liveHref?: string }> = {
  ase: {
    highlights: [
      l('Akademik İngilizce metinlerin yerel analizine odaklanır.', 'Focuses on local analysis of academic English texts.', 'Fokus auf der lokalen Analyse akademischer englischer Texte.'),
      l('Bulguları açıklanabilir biçimde sunmayı hedefler.', 'Aims to present findings in an explainable way.', 'Zielt auf nachvollziehbar dargestellte Befunde ab.'),
      l('Revizyon sürecini kontrollü ve kanıta dayalı bir akışta tutar.', 'Keeps revision in a controlled, evidence-based workflow.', 'Hält die Überarbeitung in einem kontrollierten, evidenzbasierten Ablauf.'),
    ],
  },
  'kariyer-avcisi': {
    highlights: [
      l('CV ve kullanıcı tercihlerini temel alan kariyer keşfi.', 'Career discovery based on the CV and user preferences.', 'Karriererecherche auf Basis von Lebenslauf und Nutzerpräferenzen.'),
      l('Kamuya açık kariyer sayfalarında iş fırsatlarını tarama.', 'Scans public career pages for job opportunities.', 'Durchsucht öffentlich zugängliche Karriereseiten nach Stellenangeboten.'),
      l('Eşleşmeleri açıklarken başvuru kontrolünü kullanıcıda tutar.', 'Explains matches while keeping application control with the user.', 'Erklärt Stellen-Matches und lässt die Bewerbungskontrolle beim Nutzer.'),
    ],
  },
  'secure-docs': {
    highlights: [
      l('CV, diploma ve önemli belgeler için kişisel belge merkezi.', 'Personal document center for CVs, diplomas and important files.', 'Persönliches Dokumentenzentrum für Lebenslauf, Diplome und wichtige Dateien.'),
      l('Belgeleri düzenli ve kontrollü biçimde paylaşmaya odaklanır.', 'Focuses on organized and controlled document sharing.', 'Fokus auf geordnete und kontrollierte Dokumentfreigabe.'),
      l('Portföy içindeki güvenli belge erişim akışıyla birlikte tasarlanmıştır.', 'Designed together with the secure document access flow in the portfolio.', 'Zusammen mit dem sicheren Dokumentenzugang im Portfolio konzipiert.'),
    ],
  },
  'privacy-cv-builder': {
    highlights: [
      l('CV verileri tamamen tarayıcı içinde işlenir.', 'CV data is processed entirely in the browser.', 'CV-Daten werden vollständig im Browser verarbeitet.'),
      l('Çok dilli CV ve Alman standardına uygun Anschreiben oluşturur.', 'Creates multilingual CVs and German-standard cover letters.', 'Erstellt mehrsprachige Lebensläufe und Anschreiben nach deutschem Standard.'),
      l('PDF, DOCX ve yerel proje çıktıları üretir.', 'Exports PDF, DOCX and local project files.', 'Exportiert PDF-, DOCX- und lokale Projektdateien.'),
    ],
    liveHref: 'https://cvmaker-709.pages.dev/app/',
  },
};

export default function ProjectsPage() {
  const [language, setLanguage] = useState<Language>('tr');

  useEffect(() => {
    const saved = window.sessionStorage.getItem('ym-language') as Language | null;
    if (saved === 'de' || saved === 'en' || saved === 'tr') setLanguage(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = copy[language].pageTitle;
    window.sessionStorage.setItem('ym-language', language);
  }, [language]);

  const t = copy[language];

  return (
    <main className="min-h-screen bg-[#f8fbfc] px-4 py-5 text-ink sm:px-6 sm:py-8 lg:px-10">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link href="/#projects" className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-700 transition hover:text-[#08969b]">
          <FontAwesomeIcon icon={faArrowLeft} /> {t.back}
        </Link>
        <div className="language-switcher bg-white" aria-label={t.languageSelector}>
          {(['de', 'en', 'tr'] as Language[]).map((item) => (
            <button key={item} type="button" className={language === item ? 'active' : ''} onClick={() => setLanguage(item)}>
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <section className="mx-auto mt-12 grid max-w-6xl gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-[72px_1fr] sm:items-center sm:p-8">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#071426] text-2xl text-[#12b8bd]">
          <FontAwesomeIcon icon={faLayerGroup} />
        </div>
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="m-0 text-3xl font-black tracking-tight sm:text-4xl">{t.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">{t.intro}</p>
        </div>
      </section>

      <section className="mx-auto mt-6 grid max-w-6xl gap-5" aria-label={t.title}>
        {siteData.projects.map((project) => {
          const extra = projectExtras[project.id];
          const title = 'titleLocalized' in project ? text(project.titleLocalized, language) : project.title;

          return (
            <article id={project.id} className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" key={project.id}>
              <p className="project-category">{text(project.category, language)}</p>
              <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">{title}</h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-500 sm:text-[.95rem]">{text(project.description, language)}</p>

              {extra ? (
                <div className="mt-6 border-t border-slate-200 pt-5">
                  <h3 className="text-xs font-black uppercase tracking-[.08em] text-slate-500">{t.highlights}</h3>
                  <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-600 sm:grid-cols-3">
                    {extra.highlights.map((item) => (
                      <li className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3" key={text(item, language)}>{text(item, language)}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {extra?.liveHref ? (
                <a className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#12b8bd] px-4 text-sm font-extrabold text-white no-underline transition hover:bg-[#08969b]" href={extra.liveHref} target="_blank" rel="noreferrer">
                  {t.liveApp} <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                </a>
              ) : null}
            </article>
          );
        })}
      </section>

      <footer className="mx-auto mt-8 max-w-6xl border-t border-slate-200 py-6 text-xs text-slate-400">© 2026 Design Yalçın Mutlu</footer>
    </main>
  );
}
