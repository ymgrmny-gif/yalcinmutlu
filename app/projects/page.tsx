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
    <main className="projects-detail-page">
      <header className="projects-detail-topbar">
        <Link href="/#projects" className="projects-detail-back">
          <FontAwesomeIcon icon={faArrowLeft} /> {t.back}
        </Link>
        <div className="language-switcher projects-detail-languages" aria-label={t.languageSelector}>
          {(['de', 'en', 'tr'] as Language[]).map((item) => (
            <button key={item} type="button" className={language === item ? 'active' : ''} onClick={() => setLanguage(item)}>
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <section className="projects-detail-hero">
        <div className="projects-detail-icon"><FontAwesomeIcon icon={faLayerGroup} /></div>
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </div>
      </section>

      <section className="projects-detail-list" aria-label={t.title}>
        {siteData.projects.map((project) => {
          const extra = projectExtras[project.id];
          const title = 'titleLocalized' in project ? text(project.titleLocalized, language) : project.title;

          return (
            <article id={project.id} className="project-detail-card" key={project.id}>
              <p className="project-category">{text(project.category, language)}</p>
              <h2>{title}</h2>
              <p className="project-detail-description">{text(project.description, language)}</p>

              {extra ? (
                <div className="project-detail-highlights">
                  <h3>{t.highlights}</h3>
                  <ul>
                    {extra.highlights.map((item) => <li key={text(item, language)}>{text(item, language)}</li>)}
                  </ul>
                </div>
              ) : null}

              {extra?.liveHref ? (
                <a className="project-live-link" href={extra.liveHref} target="_blank" rel="noreferrer">
                  {t.liveApp} <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                </a>
              ) : null}
            </article>
          );
        })}
      </section>

      <footer className="projects-detail-footer">© 2026 Design Yalçın Mutlu</footer>
    </main>
  );
}
