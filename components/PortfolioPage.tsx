'use client';

import Image from 'next/image';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faBars,
  faBriefcase,
  faCode,
  faDownload,
  faGraduationCap,
  faLayerGroup,
  faLocationDot,
  faLock,
  faPaperPlane,
  faShieldHalved,
  faUser,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import ContactForm from '@/components/ContactForm';
import { Language, LocalizedText, navItems, SectionId, siteData } from '@/data/siteData';

const iconMap = {
  user: faUser,
  location: faLocationDot,
  briefcase: faBriefcase,
};

const sectionIcons = {
  profile: faUser,
  education: faGraduationCap,
  experience: faBriefcase,
  skills: faCode,
  projects: faLayerGroup,
  contact: faPaperPlane,
};

const ui = {
  tr: {
    greeting: 'Merhaba, ben',
    downloadCv: 'CV İndir',
    menuOpen: 'Menüyü aç',
    menuClose: 'Menüyü kapat',
    requestAccess: 'Diğer bilgiler için erişim isteyin',
    secureDocs: 'Güvenli Belge Girişi',
    projectDetail: 'Detay',
    contactIntro: 'Belgelerime erişim talebinde bulunmak veya benimle iletişime geçmek için aşağıdaki formu kullanabilirsiniz. Yeni projeler ve fırsatlar için iletişime geçebilirsiniz.',
    thanks: 'Buraya kadar geldiğiniz için teşekkür ederim.',
    footerText: 'Yeni projeler ve fırsatlar için iletişime geçebilirsiniz.',
    modalTitle: 'Güvenli Belge Girişi',
    modalText: 'CV, diploma ve diğer özel belgeleri görüntülemek için erişim şifrenizi girin.',
    password: 'Erişim şifresi',
    continue: 'Belgelere devam et',
    cancel: 'Vazgeç',
    previewNote: 'Statik önizleme: gerçek parola doğrulaması ve erişim kayıtları Supabase bağlantısında etkinleştirilecek.',
  },
  en: {
    greeting: "Hi, I'm",
    downloadCv: 'Download CV',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    requestAccess: 'Request access for additional information',
    secureDocs: 'Secure Document Access',
    projectDetail: 'Details',
    contactIntro: 'You can use the form below to request access to my documents or contact me directly. Feel free to get in touch about new projects and opportunities.',
    thanks: 'Thank you for visiting my portfolio.',
    footerText: 'Feel free to get in touch about new projects and opportunities.',
    modalTitle: 'Secure Document Access',
    modalText: 'Enter your access password to view CVs, diplomas and other private documents.',
    password: 'Access password',
    continue: 'Continue to documents',
    cancel: 'Cancel',
    previewNote: 'Static preview: real password validation and access logging will be enabled with the Supabase integration.',
  },
  de: {
    greeting: 'Hallo, ich bin',
    downloadCv: 'CV herunterladen',
    menuOpen: 'Menü öffnen',
    menuClose: 'Menü schließen',
    requestAccess: 'Zugriff auf weitere Informationen anfragen',
    secureDocs: 'Sicherer Dokumentenzugang',
    projectDetail: 'Details',
    contactIntro: 'Über das folgende Formular können Sie den Zugang zu meinen Dokumenten anfragen oder direkt mit mir Kontakt aufnehmen. Für neue Projekte und Möglichkeiten können Sie mich gerne kontaktieren.',
    thanks: 'Vielen Dank für Ihren Besuch.',
    footerText: 'Für neue Projekte und Möglichkeiten können Sie mich gerne kontaktieren.',
    modalTitle: 'Sicherer Dokumentenzugang',
    modalText: 'Geben Sie Ihr Zugangspasswort ein, um Lebenslauf, Diplome und weitere private Dokumente anzusehen.',
    password: 'Zugangspasswort',
    continue: 'Zu den Dokumenten',
    cancel: 'Abbrechen',
    previewNote: 'Statische Vorschau: echte Passwortprüfung und Zugriffsprotokolle werden mit der Supabase-Integration aktiviert.',
  },
} as const;

function scrollToSection(id: SectionId) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function text(value: LocalizedText, language: Language) {
  return value[language];
}

export default function PortfolioPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [secureModalOpen, setSecureModalOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('tr');
  const [activeSection, setActiveSection] = useState<SectionId>('profile');
  const [progressIndex, setProgressIndex] = useState(-1);
  const [fillHeight, setFillHeight] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const labels = ui[language];

  useEffect(() => {
    const saved = window.sessionStorage.getItem('ym-language') as Language | null;
    if (saved === 'de' || saved === 'en' || saved === 'tr') setLanguage(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.sessionStorage.setItem('ym-language', language);
  }, [language]);

  const updateTimeline = useCallback(() => {
    const line = timelineRef.current;
    if (!line) return;

    const triggerY = window.innerHeight * 0.45;
    const lineRect = line.getBoundingClientRect();
    const nextHeight = Math.max(0, Math.min(lineRect.height, triggerY - lineRect.top));
    setFillHeight(nextHeight);

    const markers = Array.from(document.querySelectorAll<HTMLElement>('[data-timeline-marker]'));
    let nextProgressIndex = -1;
    let current: SectionId = 'profile';

    markers.forEach((marker, index) => {
      const markerRect = marker.getBoundingClientRect();
      const markerCenter = markerRect.top + markerRect.height / 2;
      if (markerCenter <= triggerY) {
        nextProgressIndex = index;
        current = marker.dataset.section as SectionId;
      }
    });

    setProgressIndex(nextProgressIndex);
    if (nextProgressIndex >= 0) setActiveSection(current);
  }, []);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateTimeline);
    };
    updateTimeline();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [updateTimeline]);

  const activeLabel = useMemo(() => navItems.find((item) => item.id === activeSection)?.label, [activeSection]);

  return (
    <main className="min-h-screen bg-shell text-ink">
      <aside className="portrait-rail" aria-label="Yalçın Mutlu portresi">
        <Image
          src={siteData.profileImage}
          alt="Yalçın Mutlu"
          fill
          priority
          sizes="(min-width: 1024px) 34vw, 100vw"
          className="object-cover object-[52%_18%]"
        />
        <div className="portrait-shade" />
        <div className="portrait-caption hidden lg:block">
          <p>{text(siteData.tagline, language)}</p>
          <span>— Yalçın Mutlu</span>
        </div>
      </aside>

      <div className={`nav-overlay ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <div className="nav-topbar">
          <div className="menu-language-switcher" aria-label="Language selector">
            {(['de', 'en', 'tr'] as Language[]).map((item) => (
              <button
                key={item}
                type="button"
                className={language === item ? 'active' : ''}
                onClick={() => setLanguage(item)}
                aria-pressed={language === item}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="nav-close" onClick={() => setMenuOpen(false)} aria-label={labels.menuClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <nav aria-label="Ana menü">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              className={activeSection === item.id ? 'active' : ''}
              onClick={() => {
                setMenuOpen(false);
                window.setTimeout(() => scrollToSection(item.id), 120);
              }}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {text(item.label, language)}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="nav-secure-docs"
          onClick={() => {
            setMenuOpen(false);
            setSecureModalOpen(true);
          }}
        >
          <FontAwesomeIcon icon={faLock} />
          {labels.secureDocs}
        </button>
      </div>

      <article className="portfolio-panel">
        <div className="top-stripe" aria-hidden="true"><span /><span /><span /><span /><span /></div>

        <div className="panel-actions">
          {siteData.cvHref ? (
            <a className="action-primary" href={siteData.cvHref} download>
              <FontAwesomeIcon icon={faDownload} /> {labels.downloadCv}
            </a>
          ) : null}
          <button className="icon-button" onClick={() => setMenuOpen(true)} aria-label={labels.menuOpen}>
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>

        <section className="hero-block" aria-labelledby="hero-title" data-aos="fade-up" data-aos-duration="900" data-aos-offset="24">
          <div className="hero-avatar">
            <Image
              src={siteData.profileImage}
              alt="Yalçın Mutlu profil fotoğrafı"
              fill
              sizes="180px"
              className="object-cover object-[50%_17%]"
              priority
            />
          </div>
          <div className="hero-copy">
            <p className="eyebrow">{text(siteData.eyebrow, language)}</p>
            <h1 id="hero-title">{labels.greeting} <strong>Yalçın Mutlu.</strong></h1>
            <p className="hero-role">{text(siteData.role, language)}</p>
            <p className="hero-intro">{text(siteData.intro, language)}</p>
          </div>
        </section>

        <div className="timeline-stage">
          <div ref={timelineRef} className="timeline-line" aria-hidden="true">
            <div className="timeline-fill" style={{ height: `${fillHeight}px` }} />
          </div>

          <Section id="profile" title={text(navItems[0].label, language)} icon={sectionIcons.profile} index={0} progressIndex={progressIndex}>
            <div className="profile-details">
              {siteData.details.map((detail) => (
                <div key={detail.value} className="detail-item profile-detail-item">
                  <FontAwesomeIcon icon={iconMap[detail.icon as keyof typeof iconMap]} />
                  <p>{detail.value}</p>
                </div>
              ))}
            </div>
            <div className="profile-actions">
              <button className="profile-access-button" type="button" onClick={() => scrollToSection('contact')}>
                {labels.requestAccess}<FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </Section>

          <Section id="education" title={text(navItems[1].label, language)} icon={sectionIcons.education} index={1} progressIndex={progressIndex}>
            <div className="entry-list">
              {siteData.education.map((entry, index) => (
                <article key={`${entry.period}-${index}`} className="entry">
                  <time>{entry.period}</time>
                  <div>
                    <h3>{text(entry.title, language)}</h3>
                    <p className="entry-place">{text(entry.place, language)}</p>
                    <p>{text(entry.description, language)}</p>
                  </div>
                </article>
              ))}
            </div>
          </Section>

          <Section id="experience" title={text(navItems[2].label, language)} icon={sectionIcons.experience} index={2} progressIndex={progressIndex}>
            <div className="entry-list">
              {siteData.experience.map((entry, index) => (
                <article key={`${entry.period}-${index}`} className="entry">
                  <time>{entry.period}</time>
                  <div>
                    <h3>{text(entry.title, language)}</h3>
                    <p className="entry-place">{text(entry.place, language)}</p>
                    <p>{text(entry.description, language)}</p>
                  </div>
                </article>
              ))}
            </div>
          </Section>

          <Section id="skills" title={text(navItems[3].label, language)} icon={sectionIcons.skills} index={3} progressIndex={progressIndex}>
            <div className="skill-groups">
              {siteData.skillGroups.map((group) => (
                <div className="skill-group" key={text(group.title, language)}>
                  <h3>{text(group.title, language)}</h3>
                  <div className="skill-list">
                    {group.skills.map((skill) => (
                      <div key={text(skill.name, language)} className="skill-row">
                        <div className="skill-bar">
                          <div className={`skill-fill tone-${skill.tone}`} style={{ width: `${skill.level}%` }}>
                            <span className="skill-name">{text(skill.name, language)}</span>
                          </div>
                          <span className="skill-value">{skill.level}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="projects" title={text(navItems[4].label, language)} icon={sectionIcons.projects} index={4} progressIndex={progressIndex}>
            <div className="project-grid">
              {siteData.projects.map((project) => (
                <article key={project.id} className="project-card">
                  <div className="p-4">
                    <p className="project-category">{text(project.category, language)}</p>
                    <h3>{project.title}</h3>
                    <p>{text(project.description, language)}</p>
                    <button type="button" className="project-link" title="Proje bağlantısı daha sonra eklenecek">
                      {labels.projectDetail} <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </Section>

          <Section id="contact" title={text(navItems[5].label, language)} icon={sectionIcons.contact} index={5} progressIndex={progressIndex}>
            <div className="contact-content">
              <p className="contact-message">{labels.contactIntro}</p>
              <div><ContactForm language={language} /></div>
            </div>
          </Section>
        </div>

        <footer className="site-footer">
          <div className="footer-quote" data-aos="fade-up" data-aos-duration="850" data-aos-offset="80">
            <span>“</span>
            <div><strong>{labels.thanks}</strong><p>{labels.footerText}</p></div>
          </div>
          <div className="footer-bar">© 2026 Yalçın Mutlu <span>Next.js • Tailwind CSS • AOS • EmailJS</span></div>
        </footer>
      </article>

      <div className="active-section-label hidden 2xl:block" aria-hidden="true">
        {activeLabel ? text(activeLabel, language) : ''}
      </div>

      <SecureDocumentsModal open={secureModalOpen} language={language} onClose={() => setSecureModalOpen(false)} />
    </main>
  );
}

function SecureDocumentsModal({ open, language, onClose }: { open: boolean; language: Language; onClose: () => void }) {
  const labels = ui[language];

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get('password') || '').trim();
    if (!password) return;
    window.sessionStorage.setItem('ym-doc-preview', '1');
    window.sessionStorage.setItem('ym-language', language);
    window.location.href = '/documents/';
  }

  if (!open) return null;

  return (
    <div className="secure-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="secure-modal" role="dialog" aria-modal="true" aria-labelledby="secure-modal-title">
        <button type="button" className="secure-modal-close" onClick={onClose} aria-label={labels.menuClose}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
        <div className="secure-modal-icon"><FontAwesomeIcon icon={faShieldHalved} /></div>
        <h2 id="secure-modal-title">{labels.modalTitle}</h2>
        <p>{labels.modalText}</p>
        <form onSubmit={handleSubmit} className="secure-modal-form">
          <label htmlFor="document-password">{labels.password}</label>
          <input id="document-password" name="password" type="password" autoComplete="current-password" required />
          <button type="submit" className="action-primary secure-modal-submit"><FontAwesomeIcon icon={faLock} /> {labels.continue}</button>
          <button type="button" className="secure-modal-cancel" onClick={onClose}>{labels.cancel}</button>
        </form>
        <small>{labels.previewNote}</small>
      </section>
    </div>
  );
}

function Section({ id, title, icon, index, progressIndex, children }: {
  id: SectionId;
  title: string;
  icon: typeof faUser;
  index: number;
  progressIndex: number;
  children: React.ReactNode;
}) {
  const passed = index <= progressIndex;
  const active = index === progressIndex;

  return (
    <section
      id={id}
      className="timeline-section scroll-mt-10"
      aria-labelledby={`${id}-title`}
      data-aos="fade-up"
      data-aos-duration="920"
      data-aos-offset="125"
      data-aos-anchor-placement="top-bottom"
    >
      <div className={`timeline-marker ${passed ? 'is-passed' : ''} ${active ? 'is-active' : ''}`} data-timeline-marker data-section={id} aria-hidden="true">
        <FontAwesomeIcon icon={icon} />
      </div>
      <h2 id={`${id}-title`} className="section-title">{title}</h2>
      <div className="section-body">{children}</div>
    </section>
  );
}
