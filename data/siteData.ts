export type SectionId = 'profile' | 'education' | 'experience' | 'skills' | 'projects' | 'contact';
export type Language = 'de' | 'en' | 'tr';
export type LocalizedText = Record<Language, string>;

const l = (tr: string, en: string, de: string): LocalizedText => ({ tr, en, de });

export const siteData = {
  name: 'Yalçın Mutlu',
  eyebrow: l('Kişisel Portföy', 'Personal Portfolio', 'Persönliches Portfolio'),
  role: l('CV • Deneyim • Projeler', 'CV • Experience • Projects', 'CV • Erfahrung • Projekte'),
  intro: l(
    'Bu ilk sürüm, içerikler yönetim paneline taşınmadan önce tasarım ve etkileşimlerin son halini oluşturmak için hazırlanıyor.',
    'This first version finalizes the design and interactions before the content is moved into the admin panel.',
    'Diese erste Version finalisiert Design und Interaktionen, bevor die Inhalte in das Admin-Panel übertragen werden.'
  ),
  tagline: l(
    'Fikirden uygulamaya; sade, anlaşılır ve işe yarayan işler.',
    'From idea to implementation: clear, practical and useful products.',
    'Von der Idee zur Umsetzung: klare, praktische und nützliche Produkte.'
  ),
  cvHref: '',
  profileImage: '/images/yalcin-mutlu-profile.webp',
  details: [
    { value: 'Yalçın Mutlu', icon: 'user' },
    { value: 'Almanya', icon: 'location' },
  ],
  education: [
    {
      period: '20XX — 20XX',
      title: l('Eğitim bilgisi', 'Education entry', 'Ausbildung'),
      place: l('Kurum / Üniversite', 'Institution / University', 'Institution / Universität'),
      description: l(
        'Bölüm, derece ve önemli detaylar içerik aşamasında eklenecek.',
        'Degree, field and relevant details will be added during the content phase.',
        'Abschluss, Fachgebiet und relevante Details werden in der Inhaltsphase ergänzt.'
      ),
    },
    {
      period: '20XX — 20XX',
      title: l('Ek eğitim / sertifika', 'Additional education / certificate', 'Weiterbildung / Zertifikat'),
      place: l('Kurum', 'Institution', 'Institution'),
      description: l(
        'İkinci eğitim kaydı için hazır alan.',
        'Reserved area for an additional education record.',
        'Vorbereiteter Bereich für einen weiteren Bildungsnachweis.'
      ),
    },
  ],
  experience: [
    {
      period: '20XX — Günümüz',
      title: l('Pozisyon / Rol', 'Position / Role', 'Position / Rolle'),
      place: l('Şirket / Kurum', 'Company / Institution', 'Unternehmen / Institution'),
      description: l(
        'Rol, sorumluluk ve ölçülebilir sonuçlar içerik aşamasında eklenecek.',
        'Responsibilities and measurable results will be added during the content phase.',
        'Aufgaben und messbare Ergebnisse werden in der Inhaltsphase ergänzt.'
      ),
    },
    {
      period: '20XX — 20XX',
      title: l('Önceki Pozisyon', 'Previous Position', 'Vorherige Position'),
      place: l('Şirket / Kurum', 'Company / Institution', 'Unternehmen / Institution'),
      description: l(
        'Önceki deneyim için ikinci kayıt alanı.',
        'Second record area for previous experience.',
        'Zweiter Eintrag für vorherige Berufserfahrung.'
      ),
    },
  ],
  skillGroups: [
    {
      title: l('Profesyonel Yetkinlikler', 'Professional Skills', 'Berufliche Kompetenzen'),
      skills: [
        { name: l('İletişim', 'Communication', 'Kommunikation'), level: 88, tone: 'aqua' },
        { name: l('Proje Yönetimi', 'Project Management', 'Projektmanagement'), level: 84, tone: 'navy' },
        { name: l('Problem Çözme', 'Problem Solving', 'Problemlösung'), level: 90, tone: 'red' },
      ],
    },
    {
      title: l('Dijital Yetkinlikler', 'Digital Skills', 'Digitale Kompetenzen'),
      skills: [
        { name: l('Araştırma', 'Research', 'Recherche'), level: 92, tone: 'aqua' },
        { name: l('Dijital Araçlar', 'Digital Tools', 'Digitale Werkzeuge'), level: 80, tone: 'navy' },
        { name: l('İçerik Üretimi', 'Content Production', 'Content-Erstellung'), level: 86, tone: 'green' },
      ],
    },
  ],
  projects: [
    {
      id: 'ase',
      image: '/images/projects/ase.svg',
      title: 'Academic Style Engine (ASE)',
      category: l('Akademik Yazım Teknolojisi', 'Academic Writing Technology', 'Technologie für akademisches Schreiben'),
      description: l(
        'Akademik İngilizce metinleri yerel olarak analiz eden; açıklanabilir bulgular ve kontrollü, kanıt tabanlı revizyon akışı sunan yazım motoru.',
        'A local-first academic English analysis engine with explainable findings and a controlled, evidence-based revision workflow.',
        'Eine lokal arbeitende Analyse-Engine für akademisches Englisch mit erklärbaren Befunden und kontrollierter, evidenzbasierter Überarbeitung.'
      ),
    },
    {
      id: 'kariyer-avcisi',
      image: '/images/projects/kariyer-avcisi.svg',
      title: 'Kariyer Avcısı',
      category: l('Kariyer Teknolojisi', 'Career Technology', 'Karriere-Technologie'),
      description: l(
        'CV ve tercihleri temel alarak kamuya açık kariyer sayfalarını güvenli biçimde tarayan, açıklanabilir eşleştirme ve kullanıcı onaylı başvuru akışı sunan kariyer yardımcısı.',
        'A career assistant that securely scans public career pages, explains job matches and keeps applications under explicit user control.',
        'Ein Karriere-Assistent, der öffentliche Karriereseiten sicher durchsucht, Stellen-Matches erklärt und Bewerbungen unter ausdrücklicher Nutzerkontrolle hält.'
      ),
    },
    {
      id: 'secure-docs',
      image: '/images/projects/guvenli-belge-deposu.svg',
      title: 'Kişiye Özel Güvenli Belge Deposu',
      category: l('Güvenli Belge Merkezi', 'Secure Document Center', 'Sicheres Dokumentenzentrum'),
      description: l(
        'CV, diploma ve önemli belgeleri güvenli, düzenli ve kontrollü biçimde paylaşmak için tasarlanmış kişisel belge merkezi.',
        'A personal document center designed to share CVs, diplomas and important files in a secure, organized and controlled way.',
        'Ein persönliches Dokumentenzentrum, das Lebensläufe, Diplome und wichtige Dateien sicher, geordnet und kontrolliert bereitstellt.'
      ),
    },
    {
      id: 'privacy-cv-builder',
      image: '/images/projects/privacy-cv-builder.svg',
      title: 'Privacy CV Builder',
      category: l('CV Teknolojisi', 'CV Technology', 'CV-Technologie'),
      description: l(
        'Tamamen tarayıcıda çalışan, gizlilik odaklı ve çok dilli CV ile Alman standardına uygun Anschreiben oluşturucu; PDF, DOCX ve yerel proje çıktıları üretir.',
        'A privacy-focused multilingual CV and German-standard cover-letter builder that runs entirely in the browser and exports PDF, DOCX and local project files.',
        'Ein datenschutzorientierter, mehrsprachiger CV- und Anschreiben-Builder, der vollständig im Browser läuft und PDF-, DOCX- sowie lokale Projektdateien exportiert.'
      ),
    },
  ],
  contact: {
    email: 'email@alanadi.com',
    phone: 'Bilgi eklenecek',
    location: 'Almanya',
    website: 'alanadi.com',
  },
  social: {
    linkedin: '',
    github: '',
    instagram: '',
  },
} as const;

export const navItems: { id: SectionId; label: LocalizedText }[] = [
  { id: 'profile', label: l('Profil', 'Profile', 'Profil') },
  { id: 'education', label: l('Eğitim', 'Education', 'Ausbildung') },
  { id: 'experience', label: l('Deneyim', 'Experience', 'Erfahrung') },
  { id: 'skills', label: l('Yetkinlikler', 'Skills', 'Kompetenzen') },
  { id: 'projects', label: l('Projeler', 'Projects', 'Projekte') },
  { id: 'contact', label: l('İletişim', 'Contact', 'Kontakt') },
];
