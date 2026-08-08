export type SectionId = 'profile' | 'education' | 'experience' | 'skills' | 'projects' | 'contact';
export type Language = 'de' | 'en' | 'tr';
export type LocalizedText = Record<Language, string>;

const l = (tr: string, en: string, de: string): LocalizedText => ({ tr, en, de });

export const siteData = {
  name: 'Yalçın Mutlu',
  eyebrow: l('Kişisel Portföy', 'Personal Portfolio', 'Persönliches Portfolio'),
  role: l(
    'Teknik Proje Yönetimi • Elektronik • Yapı & Hacim Akustiği • IT & Dijital Çözümler',
    'Technical Project Management • Electronics • Building & Room Acoustics • IT & Digital Solutions',
    'Technisches Projektmanagement • Elektronik • Bau- & Raumakustik • IT & Digitale Lösungen'
  ),
  intro: l(
    'Elektronik ve güvenlik sistemlerinden ses yalıtımı, hacim akustiği ve yapı uygulamalarına kadar farklı teknik alanlarda saha ve proje yönetimi deneyimine sahibim. Teknik keşif, teklif, satın alma, ekip ve taşeron koordinasyonu ile uygulama süreçlerini yönetirken sahada da aktif rol aldım. Bugün bu birikimi IT sistemleri ve yapay zekâ destekli dijital çözümlerle birleştirerek, gerçek ihtiyaçları uygulanabilir teknik ve dijital çözümlere dönüştürmeye odaklanıyorum.',
    'I have field and project management experience across technical disciplines ranging from electronic and security systems to sound insulation, room acoustics and construction applications. I have managed site surveys, quotations, purchasing, team and subcontractor coordination and implementation processes while remaining actively involved on site. Today, I combine this background with IT systems and AI-assisted digital solutions to turn real needs into practical technical and digital solutions.',
    'Ich verfüge über praktische Erfahrung im Feld- und Projektmanagement in unterschiedlichen technischen Bereichen – von Elektronik- und Sicherheitssystemen bis zu Schalldämmung, Raumakustik und Bauanwendungen. Dabei habe ich technische Bestandsaufnahmen, Angebote, Einkauf, Team- und Nachunternehmerkoordination sowie Umsetzungsprozesse gesteuert und zugleich aktiv vor Ort mitgearbeitet. Heute verbinde ich diese Erfahrung mit IT-Systemen und KI-gestützten digitalen Lösungen, um reale Anforderungen in praktikable technische und digitale Lösungen zu überführen.'
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
        'Yeni ve mevcut binalarda ses yalıtımı ve hacim akustiği projelerinin planlanması; özel akustik ürünlerin üretim ve uygulama süreçlerinin koordinasyonu; yedi kişilik teknik ekip ve gerektiğinde alt yüklenici ekiplerin yönetimi; teknik keşif, teklif hazırlama, satın alma, lojistik ve ödeme süreçlerinin takibi; montaj ve yerinde uygulamalara aktif katılım.',
        'Planned sound-insulation and room-acoustics projects for new and existing buildings; coordinated the production and application of custom acoustic products; managed a seven-person technical team and subcontractors when required; handled site surveys, quotation preparation, purchasing, logistics and payment tracking; remained actively involved in installation and on-site implementation.',
        'Planung von Schalldämmungs- und Raumakustikprojekten in Neu- und Bestandsgebäuden; Koordination der Herstellung und Anwendung spezieller Akustikprodukte; Führung eines siebenköpfigen technischen Teams sowie bei Bedarf von Nachunternehmern; technische Bestandsaufnahme, Angebotserstellung, Einkauf, Logistik und Zahlungsnachverfolgung; aktive Mitarbeit bei Montage und Vor-Ort-Ausführung.'
      ),
    },
    {
      period: '2010 — 2018',
      title: l(
        'Şirket Sahibi • Teknik Proje Yöneticisi • Elektronik Teknisyeni',
        'Company Owner • Technical Project Manager • Electronics Technician',
        'Unternehmensinhaber • Technischer Projektmanager • Elektroniktechniker'
      ),
      place: l('Webrano — Ankara, Türkiye', 'Webrano — Ankara, Türkiye', 'Webrano — Ankara, Türkei'),
      description: l(
        'Yaklaşık 400–500 kurumsal ve ticari müşteriye yerinde ve uzaktan IT, web hosting ve teknik servis desteği; Windows ve Linux sistemleri ile hosting, domain, DNS, SSL ve iş e-posta hizmetlerinin yönetimi; CCTV, hırsız alarmı ve yangın algılama/alarm sistemlerinin kurulumu, devreye alınması ve bakımı; donanım, ağ ve elektronik sistem arızalarının tespiti ve giderilmesi; ortalama beş kişilik teknik ve dijital proje ekibinin yönetimi ve koordinasyonu.',
        'Provided on-site and remote IT, web-hosting and technical support to approximately 400–500 business and institutional clients; supported Windows and Linux systems and managed hosting, domains, DNS, SSL and business email services; installed, commissioned and maintained CCTV, intrusion-alarm and fire-detection/alarm systems; diagnosed and resolved hardware, network and electronic-system faults; managed and coordinated an average five-person technical and digital project team.',
        'Vor-Ort- und Remote-IT-Support, Webhosting und technischer Service für rund 400–500 gewerbliche und institutionelle Kunden; Betreuung von Windows- und Linux-Systemen sowie Verwaltung von Hosting, Domains, DNS, SSL und geschäftlichen E-Mail-Diensten; Installation, Inbetriebnahme und Wartung von CCTV-, Einbruchmelde- und Brandmeldeanlagen; Fehlerdiagnose und Störungsbehebung an Hardware-, Netzwerk- und elektronischen Systemen; Führung und Koordination eines durchschnittlich fünfköpfigen technischen und digitalen Projektteams.'
      ),
    },
    {
      period: '2008 — 2009',
      title: l('Yayın Sistemleri Teknikeri', 'Broadcast Systems Technician', 'Techniker für Rundfunksysteme'),
      place: l('İdil Prodüksiyon — Türkiye geneli', 'İdil Prodüksiyon — Türkiye-wide', 'İdil Prodüksiyon — Türkeiweit'),
      description: l(
        'Yerel televizyon ve radyo istasyonlarının teknik kurulum, bakım ve arıza giderme çalışmalarına katılım; yayın sistemlerinin sahada kurulumu, test edilmesi ve teknik sorunlarının giderilmesine destek.',
        'Participated in technical installation, maintenance and troubleshooting of local television and radio stations; supported on-site installation, testing and fault resolution for broadcast systems.',
        'Mitarbeit bei technischer Installation, Wartung und Störungsbehebung von lokalen Fernseh- und Radiosendern; Unterstützung bei Vor-Ort-Installation, Prüfung und Fehlerbehebung von Rundfunksystemen.'
      ),
    },
    {
      period: '2006 — 2007',
      title: l(
        'Stajyer, ardından IT & Elektronik Servis Teknisyeni',
        'Intern, then IT & Electronics Service Technician',
        'Praktikant, anschließend Techniker im IT- und Elektronikservice'
      ),
      place: l('Koyuncu Holding — İstanbul, Türkiye', 'Koyuncu Holding — İstanbul, Türkiye', 'Koyuncu Holding — İstanbul, Türkei'),
      description: l(
        'Üç aylık stajın ardından yaklaşık dokuz ay teknisyen olarak bilgisayar ve IT donanımlarında bakım, onarım ve arıza tespiti; Windows kurulum ve yeniden kurulumları ile yazılım sorunlarının giderilmesi; bilgisayar bileşenleri üzerinde teknik servis; CCTV ve elektronik güvenlik sistemlerinde arıza tespiti ve onarım; elektronik cihazların test edilmesi ve yeniden devreye alınması.',
        'After a three-month internship, worked for approximately nine months as a technician performing maintenance, repair and fault diagnosis on computers and IT hardware; Windows installation and reinstallation, software troubleshooting and component-level technical service; CCTV and electronic-security fault diagnosis and repair; testing and recommissioning of electronic devices.',
        'Nach einem dreimonatigen Praktikum rund neun Monate als Techniker tätig: Wartung, Reparatur und Fehlerdiagnose an Computern und IT-Hardware; Windows-Installation und Neuinstallation sowie Behebung von Softwareproblemen; technischer Service an Computerkomponenten; Fehlerdiagnose und Reparatur an CCTV- und elektronischen Sicherheitssystemen; Prüfung und Wiederinbetriebnahme elektronischer Geräte.'
      ),
    },
  ],
  skillGroups: [
    {
      title: l('Elektronik & Güvenlik Sistemleri', 'Electronics & Security Systems', 'Elektronik & Sicherheitstechnik'),
      skills: [
        { name: l('Elektronik Sistemlerde Arıza Tespiti', 'Electronic Systems Fault Diagnosis', 'Fehlerdiagnose an elektronischen Systemen'), level: 92, levelLabel: l('İleri', 'Advanced', 'Fortgeschritten'), tone: 'aqua' },
        { name: l('CCTV & Elektronik Güvenlik Sistemleri', 'CCTV & Electronic Security Systems', 'CCTV & elektronische Sicherheitssysteme'), level: 90, levelLabel: l('İleri', 'Advanced', 'Fortgeschritten'), tone: 'navy' },
        { name: l('Yangın Algılama & Alarm Sistemleri', 'Fire Detection & Alarm Systems', 'Brandmeldeanlagen'), level: 90, levelLabel: l('İleri', 'Advanced', 'Fortgeschritten'), tone: 'red' },
        { name: l('Elektronik Sistemlerin Kurulumu & Devreye Alınması', 'Electronic Systems Installation & Commissioning', 'Installation & Inbetriebnahme elektronischer Systeme'), level: 88, levelLabel: l('Deneyimli', 'Experienced', 'Erfahren'), tone: 'green' },
      ],
    },
    {
      title: l('Teknik Proje & Saha Yönetimi', 'Technical Project & Field Management', 'Technisches Projekt- & Baustellenmanagement'),
      skills: [
        { name: l('Teknik Proje Yönetimi', 'Technical Project Management', 'Technisches Projektmanagement'), level: 92, levelLabel: l('İleri', 'Advanced', 'Fortgeschritten'), tone: 'aqua' },
        { name: l('Ekip & Alt Yüklenici Koordinasyonu', 'Team & Subcontractor Coordination', 'Team- & Nachunternehmerkoordination'), level: 86, levelLabel: l('Deneyimli', 'Experienced', 'Erfahren'), tone: 'navy' },
        { name: l('Teknik Keşif & Teklif Hazırlama', 'Technical Site Survey & Quotation Preparation', 'Technische Bestandsaufnahme & Angebotserstellung'), level: 84, levelLabel: l('Deneyimli', 'Experienced', 'Erfahren'), tone: 'red' },
        { name: l('Satın Alma & Lojistik', 'Purchasing & Logistics', 'Einkauf & Logistik'), level: 82, levelLabel: l('Deneyimli', 'Experienced', 'Erfahren'), tone: 'green' },
      ],
    },
    {
      title: l('Yapı & Hacim Akustiği', 'Building & Room Acoustics', 'Bau- & Raumakustik'),
      skills: [
        { name: l('Ses Yalıtımı', 'Sound Insulation', 'Schalldämmung'), level: 88, levelLabel: l('Deneyimli', 'Experienced', 'Erfahren'), tone: 'aqua' },
        { name: l('Hacim Akustiği', 'Room Acoustics', 'Raumakustik'), level: 86, levelLabel: l('Deneyimli', 'Experienced', 'Erfahren'), tone: 'navy' },
        { name: l('Akustik Panel Uygulamaları', 'Acoustic Panel Systems & Installation', 'Akustikpaneele & Montage'), level: 84, levelLabel: l('Deneyimli', 'Experienced', 'Erfahren'), tone: 'red' },
        { name: l('Saha & Montaj Koordinasyonu', 'Site & Installation Coordination', 'Baustellen- & Montagekoordination'), level: 84, levelLabel: l('Deneyimli', 'Experienced', 'Erfahren'), tone: 'green' },
      ],
    },
    {
      title: l('IT & Dijital Çözümler', 'IT & Digital Solutions', 'IT & Digitale Lösungen'),
      skills: [
        { name: l('Yerinde & Uzaktan IT Destek', 'On-site & Remote IT Support', 'IT-Support vor Ort & per Fernzugriff'), level: 92, levelLabel: l('İleri', 'Advanced', 'Sehr gut'), tone: 'aqua' },
        { name: l('Windows Kurulum, Bakım & Sorun Giderme', 'Windows Setup, Maintenance & Troubleshooting', 'Windows-Installation, Wartung & Fehlerbehebung'), level: 90, levelLabel: l('İleri', 'Advanced', 'Sehr gut'), tone: 'navy' },
        { name: l('Web Hosting, Domain, DNS & SSL Yönetimi', 'Web Hosting, Domains, DNS & SSL Management', 'Webhosting, Domains, DNS & SSL-Verwaltung'), level: 90, levelLabel: l('İleri', 'Advanced', 'Sehr gut'), tone: 'red' },
        { name: l('Donanım & Ağ Sorun Giderme', 'Hardware & Network Troubleshooting', 'Hardware- & Netzwerk-Fehlerbehebung'), level: 90, levelLabel: l('İleri', 'Advanced', 'Sehr gut'), tone: 'green' },
        { name: l('Windows & Linux Sunucu Desteği', 'Windows & Linux Server Support', 'Betreuung von Windows- & Linux-Servern'), level: 82, levelLabel: l('İyi', 'Good', 'Gut'), tone: 'aqua' },
        { name: l('İçerik Yönetim Sistemleri (CMS)', 'Content Management Systems (CMS)', 'Content-Management-Systeme (CMS)'), level: 80, levelLabel: l('İyi', 'Good', 'Gut'), tone: 'navy' },
        { name: l('Yapay Zekâ Destekli Dijital Ürün Geliştirme', 'AI-Assisted Digital Product Development', 'KI-gestützte Digitale Produktentwicklung'), level: 78, levelLabel: l('Proje Deneyimi', 'Project Experience', 'Projekterfahrung'), tone: 'red' },
        { name: l('Temel API, Otomasyon & Teknik Test Deneyimi', 'Basic API, Automation & Technical Testing Experience', 'Grundkenntnisse in APIs, Automatisierung & technischen Tests'), level: 68, levelLabel: l('Temel / Proje Deneyimi', 'Basic / Project Experience', 'Grundkenntnisse / Projekterfahrung'), tone: 'green' },
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