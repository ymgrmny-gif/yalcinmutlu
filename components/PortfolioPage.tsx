'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faBars,
  faBriefcase,
  faCalendarDays,
  faCode,
  faDownload,
  faEnvelope,
  faGlobe,
  faGraduationCap,
  faLayerGroup,
  faLocationDot,
  faPaperPlane,
  faPhone,
  faUser,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { faGithub, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import ContactForm from '@/components/ContactForm';
import { navItems, SectionId, siteData } from '@/data/siteData';

const iconMap = {
  user: faUser,
  location: faLocationDot,
  email: faEnvelope,
  phone: faPhone,
  web: faGlobe,
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

function scrollToSection(id: SectionId) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function PortfolioPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('profile');
  const [fillHeight, setFillHeight] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  const updateTimeline = useCallback(() => {
    const line = timelineRef.current;
    if (!line) return;

    const triggerY = window.innerHeight * 0.45;
    const rect = line.getBoundingClientRect();
    const nextHeight = Math.max(0, Math.min(rect.height, triggerY - rect.top));
    setFillHeight(nextHeight);

    const markers = Array.from(document.querySelectorAll<HTMLElement>('[data-timeline-marker]'));
    let current: SectionId = 'profile';
    for (const marker of markers) {
      if (marker.getBoundingClientRect().top <= triggerY + 2) {
        current = marker.dataset.section as SectionId;
      }
    }
    setActiveSection(current);
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

  const activeIndex = navItems.findIndex((item) => item.id === activeSection);

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
        <button className="menu-trigger" onClick={() => setMenuOpen(true)} aria-label="Menüyü aç">
          <FontAwesomeIcon icon={faBars} />
          <span>MENÜ</span>
        </button>
        <div className="portrait-caption hidden lg:block">
          <p>{siteData.tagline}</p>
          <span>— Yalçın Mutlu</span>
        </div>
      </aside>

      <div className={`nav-overlay ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <button className="nav-close" onClick={() => setMenuOpen(false)} aria-label="Menüyü kapat">
          <FontAwesomeIcon icon={faXmark} />
        </button>
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
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <article className="portfolio-panel">
        <div className="top-stripe" aria-hidden="true">
          <span /><span /><span /><span /><span />
        </div>

        <div className="panel-actions">
          {siteData.cvHref ? (
            <a className="action-primary" href={siteData.cvHref} download>
              <FontAwesomeIcon icon={faDownload} /> CV İndir
            </a>
          ) : (
            <button className="action-primary opacity-55" type="button" disabled title="CV dosyası daha sonra eklenecek">
              <FontAwesomeIcon icon={faDownload} /> CV İndir
            </button>
          )}
          <button className="icon-button" onClick={() => scrollToSection('contact')} aria-label="İletişime git">
            <FontAwesomeIcon icon={faEnvelope} />
          </button>
        </div>

        <section className="hero-block" aria-labelledby="hero-title">
          <div className="hero-avatar" data-aos="zoom-in">
            <Image
              src={siteData.profileImage}
              alt="Yalçın Mutlu profil fotoğrafı"
              fill
              sizes="180px"
              className="object-cover object-[50%_17%]"
              priority
            />
          </div>
          <div className="hero-copy" data-aos="fade-left">
            <p className="eyebrow">{siteData.eyebrow}</p>
            <h1 id="hero-title">Merhaba, ben <strong>Yalçın Mutlu.</strong></h1>
            <p className="hero-role">{siteData.role}</p>
            <p className="hero-intro">{siteData.intro}</p>
          </div>
        </section>

        <div className="timeline-stage">
          <div ref={timelineRef} className="timeline-line" aria-hidden="true">
            <div className="timeline-fill" style={{ height: `${fillHeight}px` }} />
          </div>

          <Section id="profile" title="Profil" icon={sectionIcons.profile} index={0} activeIndex={activeIndex}>
            <div className="grid gap-x-10 gap-y-6 md:grid-cols-2" data-aos="fade-up">
              {siteData.details.map((detail) => (
                <div key={detail.label} className="detail-item">
                  <FontAwesomeIcon icon={iconMap[detail.icon]} />
                  <div>
                    <span>{detail.label}</span>
                    <p>{detail.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="education" title="Eğitim" icon={sectionIcons.education} index={1} activeIndex={activeIndex}>
            <div className="entry-list">
              {siteData.education.map((entry, index) => (
                <article key={`${entry.period}-${index}`} className="entry" data-aos="fade-up">
                  <time>{entry.period}</time>
                  <div>
                    <h3>{entry.title}</h3>
                    <p className="entry-place">{entry.place}</p>
                    <p>{entry.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </Section>

          <Section id="experience" title="Deneyim" icon={sectionIcons.experience} index={2} activeIndex={activeIndex}>
            <div className="entry-list">
              {siteData.experience.map((entry, index) => (
                <article key={`${entry.period}-${index}`} className="entry" data-aos="fade-up">
                  <time>{entry.period}</time>
                  <div>
                    <h3>{entry.title}</h3>
                    <p className="entry-place">{entry.place}</p>
                    <p>{entry.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </Section>

          <Section id="skills" title="Yetkinlikler" icon={sectionIcons.skills} index={3} activeIndex={activeIndex}>
            <div className="grid gap-x-12 gap-y-5 md:grid-cols-2" data-aos="fade-up">
              {siteData.skills.map((skill) => (
                <div key={skill.name} className="skill-row">
                  <div><span>{skill.name}</span><span>{skill.level}%</span></div>
                  <div className="skill-track"><span style={{ width: `${skill.level}%` }} /></div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="projects" title="Projeler" icon={sectionIcons.projects} index={4} activeIndex={activeIndex}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {siteData.projects.map((project, index) => (
                <article key={`${project.number}-${index}`} className="project-card" data-aos="fade-up" data-aos-delay={index * 60}>
                  <div className="project-preview" aria-hidden="true">
                    <span>{project.number}</span>
                    <div className="mini-ui"><i /><i /><i /></div>
                  </div>
                  <div className="p-4">
                    <p className="project-category">{project.category}</p>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <button type="button" className="project-link" title="Proje bağlantısı daha sonra eklenecek">
                      Detay <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </Section>

          <Section id="contact" title="İletişim" icon={sectionIcons.contact} index={5} activeIndex={activeIndex}>
            <div className="grid gap-10 xl:grid-cols-[.75fr_1.25fr]">
              <div className="contact-list" data-aos="fade-right">
                <ContactLine icon={faLocationDot} text={siteData.contact.location} />
                <ContactLine icon={faPhone} text={siteData.contact.phone} />
                <ContactLine icon={faEnvelope} text={siteData.contact.email} />
                <ContactLine icon={faGlobe} text={siteData.contact.website} />
                <div className="social-row" aria-label="Sosyal medya bağlantıları">
                  <SocialPlaceholder icon={faLinkedinIn} label="LinkedIn" />
                  <SocialPlaceholder icon={faGithub} label="GitHub" />
                  <SocialPlaceholder icon={faInstagram} label="Instagram" />
                </div>
              </div>
              <div data-aos="fade-left"><ContactForm /></div>
            </div>
          </Section>
        </div>

        <footer className="site-footer">
          <div className="footer-quote" data-aos="fade-up">
            <span>“</span>
            <div><strong>Buraya kadar geldiğiniz için teşekkür ederim.</strong><p>Yeni projeler ve fırsatlar için iletişime geçebilirsiniz.</p></div>
          </div>
          <div className="footer-bar">© 2026 Yalçın Mutlu <span>Next.js • Tailwind CSS • AOS • EmailJS</span></div>
        </footer>
      </article>

      <div className="active-section-label hidden 2xl:block" aria-hidden="true">
        {navItems.find((item) => item.id === activeSection)?.label}
      </div>
    </main>
  );
}

function Section({
  id,
  title,
  icon,
  index,
  activeIndex,
  children,
}: {
  id: SectionId;
  title: string;
  icon: typeof faUser;
  index: number;
  activeIndex: number;
  children: React.ReactNode;
}) {
  const passed = index <= activeIndex;
  const active = index === activeIndex;
  return (
    <section id={id} className="timeline-section scroll-mt-10" aria-labelledby={`${id}-title`}>
      <div
        className={`timeline-marker ${passed ? 'is-passed' : ''} ${active ? 'is-active' : ''}`}
        data-timeline-marker
        data-section={id}
        aria-hidden="true"
      >
        <FontAwesomeIcon icon={icon} />
      </div>
      <h2 id={`${id}-title`} className="section-title" data-aos="fade-right">{title}</h2>
      <div className="section-body">{children}</div>
    </section>
  );
}

function ContactLine({ icon, text }: { icon: typeof faPhone; text: string }) {
  return <div><FontAwesomeIcon icon={icon} /><span>{text}</span></div>;
}

function SocialPlaceholder({ icon, label }: { icon: typeof faLinkedinIn; label: string }) {
  return (
    <button type="button" aria-label={`${label} bağlantısı daha sonra eklenecek`} title={`${label} bağlantısı daha sonra eklenecek`}>
      <FontAwesomeIcon icon={icon} />
    </button>
  );
}
