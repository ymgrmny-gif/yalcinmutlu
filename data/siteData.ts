export type SectionId = 'profile' | 'education' | 'experience' | 'skills' | 'projects' | 'contact';
export type Language = 'de' | 'en' | 'tr';
export type LocalizedText = Record<Language, string>;

const l = (tr: string, en: string, de: string): LocalizedText => ({ tr, en, de });

export const siteData = {
  name: 'Yalçın Mutlu',
  eyebrow: l('Kişisel Portföy', 'Personal Portfolio', 'Persönliches Portfolio'),
  role: l(
    'Elektronik • Teknik Proje Yönetimi • Dijital Ürünler',
    'Electronics • Technical Project Management • Digital Products',
    'Elektronik • Technisches Projektmanagement • Digitale Produkte'
  ),
  intro: l(
    'Elektronik sistemler, güvenlik teknolojileri ve teknik proje yönetimindeki saha deneyimimi modern yazılım geliştirme ile birleştiriyorum. Teknik problemleri analiz etmekten ekip ve uygulama süreçlerini yönetmeye, dijital ürünler geliştirmekten sistemleri sahada devreye almaya kadar çok disiplinli çalışıyorum.',
    'I combine hands-on experience in electronic systems, security technology and technical project management with modern software development. My work spans technical problem analysis, team and field coordination, digital product development and system commissioning.',
    'Ich verbinde praktische Erfahrung in elektronischen Systemen, Sicherheitstechnik und technischem Projektmanagement mit moderner Softwareentwicklung. Mein Arbeitsfeld reicht von technischer Fehleranalyse, Team- und Montagekoordination bis zur Entwicklung digitaler Produkte und Inbetriebnahme von Systemen.'
  ),
  tagline: l(
    'Teknik deneyim, sistem düşüncesi ve dijital üretimi aynı projede buluşturmak.',
    'Bringing technical experience, systems thinking and digital creation into the same project.',
    'Technische Erfahrung, Systemdenken und digitale Entwicklung in einem Projekt verbinden.'
  ),
  cvHref: '',
  profileImage: '/images/yalcin-mutlu-profile.webp',
  details: [
    { value: 'Yalçın Mutlu', icon: 'user' },
    { value: 'Almanya', icon: 'location' },
  ],
  education: [
    {
      period: '2008 — 2012',
      title: l('Lisans — İktisat', 'Bachelor — Economics', 'Bachelor — Volkswirtschaftslehre'),
      place: l(
        'Anadolu Üniversitesi — Eskişehir, Türkiye',
        'Anadolu University — Eskişehir, Türkiye',
        'Anadolu Universität — Eskişehir, Türkei'
      ),
      description: l(
        'İktisat lisans eğitimi.',
        'Bachelor-level education in economics.',
        'Bachelorstudium im Bereich Volkswirtschaftslehre.'
      ),
    },
    {
      period: '2004 — 2006',
      title: l('Ön Lisans — Endüstriyel Elektronik', 'Associate Degree — Industrial Electronics', 'Associate Degree — Industrieelektronik'),
      place: l(
        'Süleyman Demirel Üniversitesi — Isparta, Türkiye',
        'Süleyman Demirel University — Isparta, Türkiye',
        'Süleyman-Demirel-Universität — Isparta, Türkei'
      ),
      description: l(
        'Elektronik devreler, ölçüm sistemleri, bakım ve arıza tespiti üzerine uygulamalı eğitim.',
        'Applied training in electronic circuits, measurement systems, maintenance and fault diagnosis.',
        'Praxisorientierte Ausbildung in elektronischen Schaltungen, Messtechnik, Wartung und Fehlerdiagnose.'
      ),
    },
  ],
  experience: [
    {
      period: '2018 — 12/2024',
      title: l(
        'Şirket Sahibi & Teknik Proje Yöneticisi',
        'Company Owner & Technical Project Manager',
        'Unternehmensinhaber & Technischer Projektmanager'
      ),
      place: l('Mutlu Akustik — Ankara, Türkiye', 'Mutlu Akustik — Ankara, Türkiye', 'Mutlu Akustik — Ankara, Türkei'),
      description: l(
        'Ses yalıtımı ve oda akustiği projelerinin planlanması; yedi kişilik teknik ekip ve gerektiğinde taşeron ekiplerin yönetimi; teknik keşif, teklif, satın alma, lojistik, ödeme takibi ve saha uygulamalarına aktif katılım.',
        'Planned sound-insulation and room-acoustics projects; managed a seven-person technical team and subcontractors when needed; handled site surveys, quotations, purchasing, logistics, payment tracking and hands-on field installation.',
        'Planung von Schallschutz- und Raumakustikprojekten; Führung eines siebenköpfigen technischen Teams sowie bei Bedarf von Nachunternehmern; technische Bestandsaufnahme, Angebotserstellung, Einkauf, Logistik, Zahlungsnachverfolgung und aktive Mitarbeit bei Montagearbeiten.'
      ),
    },
    {
      period: '2010 — 2018',
      title: l(
        'Şirket Sahibi, Teknik Proje Yöneticisi & Elektronik Teknisyeni',
        'Company Owner, Technical Project Manager & Electronics Technician',
        'Unternehmensinhaber, Technischer Projektmanager & Elektroniktechniker'
      ),
      place: l('Webrano — Ankara, Türkiye', 'Webrano — Ankara, Türkiye', 'Webrano — Ankara, Türkei'),
      description: l(
        'Ortalama beş kişilik teknik ve dijital proje ekibinin yönetimi; CCTV, hırsız ve yangın alarm sistemlerinin kurulumu, devreye alınması ve bakımı; donanım, ağ ve elektronik sistemlerde arıza tespiti ve giderme.',
        'Managed an average five-person technical and digital project team; installed, commissioned and maintained CCTV, intrusion and fire-alarm systems; diagnosed and resolved hardware, network and electronic system faults.',
        'Führung eines durchschnittlich fünfköpfigen technischen und digitalen Projektteams; Installation, Inbetriebnahme und Wartung von CCTV-, Einbruch- und Brandmeldeanlagen sowie Fehlerdiagnose und Störungsbehebung an Hardware-, Netzwerk- und Elektroniksystemen.'
      ),
    },
    {
      period: '2008 — 2009',
      title: l('Yayın Sistemleri Teknikeri', 'Broadcast Systems Technician', 'Techniker für Rundfunksysteme'),
      place: l('İdil Prodüksiyon — Türkiye geneli', 'İdil Prodüksiyon — Türkiye-wide', 'İdil Prodüksiyon — Türkeiweit'),
      description: l(
        'Yerel televizyon ve radyo istasyonlarının teknik kurulum, bakım ve arıza giderme çalışmalarına katılım.',
        'Participated in technical installation, maintenance and troubleshooting of local television and radio stations.',
        'Mitarbeit bei technischer Installation, Wartung und Störungsbehebung von lokalen Fernseh- und Radiosendern.'
      ),
    },
  ],
  skillGroups: [
    {
      title: l('Elektronik & Güvenlik Sistemleri', 'Electronics & Security Systems', 'Elektronik & Sicherheitstechnik'),
      skills: [
        { name: l('Elektronik Arıza Tespiti', 'Electronic Fault Diagnosis', 'Elektronische Fehlerdiagnose'), level: 92, levelLabel: l('İleri', 'Advanced', 'Fortgeschritten'), tone: 'aqua' },
        { name: l('CCTV & Güvenlik Sistemleri', 'CCTV & Security Systems', 'CCTV- & Sicherheitssysteme'), level: 90, levelLabel: l('İleri', 'Advanced', 'Fortgeschritten'), tone: 'navy' },
        { name: l('Yangın Alarm Sistemleri', 'Fire Alarm Systems', 'Brandmeldeanlagen'), level: 90, levelLabel: l('İleri', 'Advanced', 'Fortgeschritten'), tone: 'red' },
        { name: l('Devre Geliştirme', 'Circuit Development', 'Schaltungsentwicklung'), level: 88, levelLabel: l('İleri', 'Advanced', 'Fortgeschritten'), tone: 'green' },
        { name: l('Donanım & Ağ Arıza Tespiti', 'Hardware & Network Diagnostics', 'Hardware- & Netzwerkdiagnose'), level: 78, levelLabel: l('Uygulamalı', 'Hands-on', 'Praxiserfahrung'), tone: 'navy' },
      ],
    },
    {
      title: l('Teknik Proje & Saha Yönetimi', 'Technical Project & Field Management', 'Technisches Projekt- & Baustellenmanagement'),
      skills: [
        { name: l('Teknik Proje Yönetimi', 'Technical Project Management', 'Technisches Projektmanagement'), level: 92, levelLabel: l('İleri', 'Advanced', 'Fortgeschritten'), tone: 'aqua' },
        { name: l('Ekip & Taşeron Koordinasyonu', 'Team & Subcontractor Coordination', 'Team- & Nachunternehmerkoordination'), level: 86, levelLabel: l('Deneyimli', 'Experienced', 'Erfahren'), tone: 'navy' },
        { name: l('Teknik Keşif & Teklif', 'Technical Survey & Quotation', 'Technische Bestandsaufnahme & Angebot'), level: 84, levelLabel: l('Deneyimli', 'Experienced', 'Erfahren'), tone: 'red' },
        { name: l('Satın Alma & Lojistik', 'Purchasing & Logistics', 'Einkauf & Logistik'), level: 82, levelLabel: l('Deneyimli', 'Experienced', 'Erfahren'), tone: 'green' },
      ],
    },
    {
      title: l('Akustik & Teknik Uygulama', 'Acoustics & Technical Installation', 'Akustik & Technische Montage'),
      skills: [
        { name: l('Ses Yalıtımı', 'Sound Insulation', 'Schallschutztechnik'), level: 88, levelLabel: l('Deneyimli', 'Experienced', 'Erfahren'), tone: 'aqua' },
        { name: l('Oda Akustiği', 'Room Acoustics', 'Raumakustik'), level: 86, levelLabel: l('Deneyimli', 'Experienced', 'Erfahren'), tone: 'navy' },
        { name: l('Montaj & Yerinde Uygulama', 'Installation & On-site Work', 'Montage & Vor-Ort-Ausführung'), level: 84, levelLabel: l('Deneyimli', 'Experienced', 'Erfahren'), tone: 'red' },
      ],
    },
    {
      title: l('Yazılım & Dijital Sistemler', 'Software & Digital Systems', 'Software & Digitale Systeme'),
      skills: [
        { name: l('React & TypeScript', 'React & TypeScript', 'React & TypeScript'), level: 76, levelLabel: l('Proje Deneyimi', 'Project Experience', 'Projekterfahrung'), tone: 'aqua' },
        { name: l('Zustand State Yönetimi', 'Zustand State Management', 'Zustand State Management'), level: 72, levelLabel: l('Proje Deneyimi', 'Project Experience', 'Projekterfahrung'), tone: 'navy' },
        { name: l('REST API Entegrasyonları', 'REST API Integrations', 'REST-API-Integrationen'), level: 74, levelLabel: l('Proje Deneyimi', 'Project Experience', 'Projekterfahrung'), tone: 'red' },
        { name: l('Node.js Script Geliştirme', 'Node.js Script Development', 'Node.js-Skriptentwicklung'), level: 72, levelLabel: l('Proje Deneyimi', 'Project Experience', 'Projekterfahrung'), tone: 'green' },
        { name: l('E2E Test Otomasyonu', 'E2E Test Automation', 'E2E-Testautomatisierung'), level: 74, levelLabel: l('Proje Deneyimi', 'Project Experience', 'Projekterfahrung'), tone: 'aqua' },
      ],
    },
  ],
  projects: [
    {
      id: 'ase',
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
