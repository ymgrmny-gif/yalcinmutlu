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
    { value: l('Yalçın Mutlu', 'Yalçın Mutlu', 'Yalçın Mutlu'), icon: 'user' },
    { value: l('Almanya', 'Germany', 'Deutschland'), icon: 'location' },
    { value: l('+4915228245042', '+4915228245042', '+4915228245042'), icon: 'phone' },
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
        'Teknik Proje Yöneticisi',
        'Technical Project Manager',
        'Technischer Projektmanager'
      ),
      place: l('Mutlu Akustik — Ankara, Türkiye', 'Mutlu Akustik — Ankara, Türkiye', 'Mutlu Akustik — Ankara, Türkei'),
      description: l(
        'Yeni ve mevcut binalarda ses yalıtımı ve hacim akustiği projelerinin planlanması; özel akustik ürünlerin üretim ve uygulama süreçlerinin koordinasyonu; yedi kişilik teknik ekip ve gerektiğinde alt yüklenici ekiplerin yönetimi; teknik keşif, teklif hazırlama, satın alma, lojistik ve ödeme süreçlerinin takibi; montaj ve yerinde uygulamalara aktif katılım.',
        'Planned sound-insulation and room-acoustics projects for new and existing buildings; coordinated the production and application of custom acoustic products; managed a seven-person technical team and subcontractors when required; handled site surveys, quotation preparation, purchasing, logistics and payment tracking; remained actively involved in installation and on-site implementation.',
        'Planung von Schalldämmungs- und Raumakustikprojekten in Neu- und Bestandsgebäuden; Koordination der Herstellung und Anwendung spezieller Akustikprodukte; Führung eines siebenköpfigen technischen Teams sowie bei Bedarf von Nachunternehmern; technische Bestandsaufnahme, Angebotserstellung, Einkauf, Logistik und Zahlungsnachverfolgung; aktive Mitarbeit bei Montage und Vor-Ort-Ausführung.'
      ),
      experienceLabel: l('Uygulamalı Saha Deneyimi', 'Hands-on Field Experience', 'Praktische Baustellenerfahrung'),
      experienceTags: [
        l('Metal Konstrüksiyon & Karkas', 'Metal Construction & Framing', 'Metallbau & Metallständerwerk'),
        l('Alçı & Alçıpan Uygulamaları', 'Plaster & Drywall Work', 'Gips- & Trockenbauarbeiten'),
        l('Giydirme Duvar & Asma Tavan', 'Wall Linings & Suspended Ceilings', 'Vorsatzschalen & abgehängte Decken'),
        l('Elektrot Kaynağı (MMA)', 'MMA / Stick Welding', 'E-Hand-Schweißen (111)'),
        l('Metal Kesme & Birleştirme', 'Metal Cutting & Joining', 'Metallbearbeitung: Zuschnitt & Verbindung'),
        l('Dübel & Ankraj', 'Anchoring & Fixing', 'Dübel- & Verankerungstechnik'),
        l('Taş Yünü & Ses Yalıtımı', 'Rock Wool & Sound Insulation', 'Steinwolldämmung & Schalldämmung'),
        l('Akustik Panel Montajı', 'Acoustic Panel Installation', 'Montage von Akustikpaneelen'),
        l('Ölçülendirme & Alt Konstrüksiyon', 'Measurement & Substructure', 'Aufmaß & Unterkonstruktionen'),
        l('El & Elektrikli Aletler', 'Hand & Power Tools', 'Hand- & Elektrowerkzeuge'),
      ],
    },
    {
      period: '2010 — 2018',
      title: l(
        'Teknik Proje Yöneticisi • Elektronik Teknikeri',
        'Technical Project Manager • Electronics Technician',
        'Technischer Projektmanager • Elektroniktechniker'
      ),
      place: l('Webrano — Ankara, Türkiye', 'Webrano — Ankara, Türkiye', 'Webrano — Ankara, Türkei'),
      description: l(
        'Yaklaşık 400–500 kurumsal ve ticari müşteriye yerinde ve uzaktan IT, web hosting ve teknik servis desteği; Windows ve Linux sistemleri ile hosting, domain, DNS, SSL ve iş e-posta hizmetlerinin yönetimi; CCTV, hırsız alarmı ve yangın algılama/alarm sistemlerinin kurulumu, devreye alınması ve bakımı; donanım, ağ ve elektronik sistem arızalarının tespiti ve giderilmesi; ortalama beş kişilik teknik ve dijital proje ekibinin yönetimi ve koordinasyonu.',
        'Provided on-site and remote IT, web-hosting and technical support to approximately 400–500 business and institutional clients; supported Windows and Linux systems and managed hosting, domains, DNS, SSL and business email services; installed, commissioned and maintained CCTV, intrusion-alarm and fire-detection/alarm systems; diagnosed and resolved hardware, network and electronic-system faults; managed and coordinated an average five-person technical and digital project team.',
        'Vor-Ort- und Remote-IT-Support, Webhosting und technischer Service für rund 400–500 gewerbliche und institutionelle Kunden; Betreuung von Windows- und Linux-Systemen sowie Verwaltung von Hosting, Domains, DNS, SSL und geschäftlichen E-Mail-Diensten; Installation, Inbetriebnahme und Wartung von CCTV-, Einbruchmelde- und Brandmeldeanlagen; Fehlerdiagnose und Störungsbehebung an Hardware-, Netzwerk- und elektronischen Systemen; Führung und Koordination eines durchschnittlich fünfköpfigen technischen und digitalen Projektteams.'
      ),
      experienceLabel: l('Uygulamalı Teknik Deneyim', 'Hands-on Technical Experience', 'Praktische technische Erfahrung'),
      experienceTags: [
        l('Yerinde & Uzaktan IT Destek', 'On-site & Remote IT Support', 'IT-Support vor Ort & per Fernzugriff'),
        l('Windows & Linux Sistemleri', 'Windows & Linux Systems', 'Windows- & Linux-Systeme'),
        l('Donanım & Ağ Sorun Giderme', 'Hardware & Network Troubleshooting', 'Hardware- & Netzwerk-Fehlerbehebung'),
        l('Web Hosting • DNS • SSL', 'Web Hosting • DNS • SSL', 'Webhosting • DNS • SSL'),
        l('CCTV Sistemleri', 'CCTV Systems', 'CCTV-Systeme'),
        l('Hırsız Alarm Sistemleri', 'Intrusion Alarm Systems', 'Einbruchmeldeanlagen'),
        l('Yangın Algılama & Alarm', 'Fire Detection & Alarm', 'Brandmelde- & Alarmsysteme'),
        l('Kurulum & Devreye Alma', 'Installation & Commissioning', 'Installation & Inbetriebnahme'),
        l('Elektronik Arıza Giderme', 'Electronic Troubleshooting', 'Fehlerbehebung an elektronischen Systemen'),
        l('Teknik Ekip Koordinasyonu', 'Technical Team Coordination', 'Koordination technischer Teams'),
      ],
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
      experienceLabel: l('Uygulamalı Teknik Deneyim', 'Hands-on Technical Experience', 'Praktische technische Erfahrung'),
      experienceTags: [
        l('Yayın Sistemleri Kurulumu', 'Broadcast System Installation', 'Installation von Rundfunksystemen'),
        l('Saha Montajı', 'Field Installation', 'Vor-Ort-Montage'),
        l('Sistem Testleri', 'System Testing', 'Systemprüfung'),
        l('Bakım', 'Maintenance', 'Wartung'),
        l('Arıza Tespiti & Giderme', 'Fault Diagnosis & Troubleshooting', 'Fehlerdiagnose & Störungsbehebung'),
      ],
    },
    {
      period: '2006 — 2007',
      title: l(
        'Stajyer, ardından IT & Elektronik Servis Teknikeri',
        'Intern, then IT & Electronics Service Technician',
        'Praktikant, anschließend Techniker im IT- und Elektronikservice'
      ),
      place: l('Koyuncu Holding — İstanbul, Türkiye', 'Koyuncu Holding — İstanbul, Türkiye', 'Koyuncu Holding — İstanbul, Türkei'),
      description: l(
        'Üç aylık stajın ardından yaklaşık dokuz ay tekniker olarak bilgisayar ve IT donanımlarında bakım, onarım ve arıza tespiti; Windows kurulum ve yeniden kurulumları ile yazılım sorunlarının giderilmesi; bilgisayar bileşenleri üzerinde teknik servis; CCTV ve elektronik güvenlik sistemlerinde arıza tespiti ve onarım; elektronik cihazların test edilmesi ve yeniden devreye alınması.',
        'After a three-month internship, worked for approximately nine months as a technician performing maintenance, repair and fault diagnosis on computers and IT hardware; Windows installation and reinstallation, software troubleshooting and component-level technical service; CCTV and electronic-security fault diagnosis and repair; testing and recommissioning of electronic devices.',
        'Nach einem dreimonatigen Praktikum rund neun Monate als Techniker tätig: Wartung, Reparatur und Fehlerdiagnose an Computern und IT-Hardware; Windows-Installation und Neuinstallation sowie Behebung von Softwareproblemen; technischer Service an Computerkomponenten; Fehlerdiagnose und Reparatur an CCTV- und elektronischen Sicherheitssystemen; Prüfung und Wiederinbetriebnahme elektronischer Geräte.'
      ),
      experienceLabel: l('Uygulamalı Teknik Deneyim', 'Hands-on Technical Experience', 'Praktische technische Erfahrung'),
      experienceTags: [
        l('Bilgisayar Donanımı', 'Computer Hardware', 'Computerhardware'),
        l('Windows Kurulum & Yeniden Kurulum', 'Windows Installation & Reinstallation', 'Windows-Installation & Neuinstallation'),
        l('Teknik Servis', 'Technical Service', 'IT- & Elektronikservice'),
        l('Elektronik Arıza Tespiti', 'Electronic Fault Diagnosis', 'Fehlerdiagnose an elektronischen Systemen'),
        l('CCTV & Güvenlik Sistemleri', 'CCTV & Security Systems', 'CCTV- & Sicherheitssysteme'),
        l('Elektronik Cihaz Testi', 'Electronic Device Testing', 'Prüfung elektronischer Geräte'),
        l('Bakım & Onarım', 'Maintenance & Repair', 'Wartung & Reparatur'),
      ],
    },
  ],
  skillGroups: [
    {
      title: l('Elektronik & Güvenlik Sistemleri', 'Electronics & Security Systems', 'Elektronik & Sicherheitstechnik'),
      skills: [
        { name: l('Elektronik Sistemlerde Arıza Tespiti', 'Electronic Systems Fault Diagnosis', 'Fehlerdiagnose an elektronischen Systemen') },
        { name: l('CCTV & Elektronik Güvenlik Sistemleri', 'CCTV & Electronic Security Systems', 'CCTV & elektronische Sicherheitssysteme') },
        { name: l('Yangın Algılama & Alarm Sistemleri', 'Fire Detection & Alarm Systems', 'Brandmeldeanlagen') },
        { name: l('Elektronik Sistemlerin Kurulumu & Devreye Alınması', 'Electronic Systems Installation & Commissioning', 'Installation & Inbetriebnahme elektronischer Systeme') },
      ],
    },
    {
      title: l('Teknik Proje & Saha Yönetimi', 'Technical Project & Field Management', 'Technisches Projekt- & Baustellenmanagement'),
      skills: [
        { name: l('Teknik Proje Yönetimi', 'Technical Project Management', 'Technisches Projektmanagement') },
        { name: l('Ekip & Alt Yüklenici Koordinasyonu', 'Team & Subcontractor Coordination', 'Team- & Nachunternehmerkoordination') },
        { name: l('Teknik Keşif & Teklif Hazırlama', 'Technical Site Survey & Quotation Preparation', 'Technische Bestandsaufnahme & Angebotserstellung') },
        { name: l('Satın Alma & Lojistik', 'Purchasing & Logistics', 'Einkauf & Logistik') },
      ],
    },
    {
      title: l('Yapı & Hacim Akustiği', 'Building & Room Acoustics', 'Bau- & Raumakustik'),
      skills: [
        { name: l('Ses Yalıtımı', 'Sound Insulation', 'Schalldämmung') },
        { name: l('Hacim Akustiği', 'Room Acoustics', 'Raumakustik') },
        { name: l('Akustik Panel Uygulamaları', 'Acoustic Panel Systems & Installation', 'Akustikpaneele & Montage') },
        { name: l('Saha & Montaj Koordinasyonu', 'Site & Installation Coordination', 'Baustellen- & Montagekoordination') },
      ],
    },
    {
      title: l('IT & Dijital Çözümler', 'IT & Digital Solutions', 'IT & Digitale Lösungen'),
      skills: [
        { name: l('Yerinde & Uzaktan IT Destek', 'On-site & Remote IT Support', 'IT-Support vor Ort & per Fernzugriff') },
        { name: l('Windows Kurulum, Bakım & Sorun Giderme', 'Windows Setup, Maintenance & Troubleshooting', 'Windows-Installation, Wartung & Fehlerbehebung') },
        { name: l('Web Hosting, Domain, DNS & SSL Yönetimi', 'Web Hosting, Domains, DNS & SSL Management', 'Webhosting, Domains, DNS & SSL-Verwaltung') },
        { name: l('Donanım & Ağ Sorun Giderme', 'Hardware & Network Troubleshooting', 'Hardware- & Netzwerk-Fehlerbehebung') },
        { name: l('Windows & Linux Sunucu Desteği', 'Windows & Linux Server Support', 'Betreuung von Windows- & Linux-Servern') },
        { name: l('İçerik Yönetim Sistemleri (CMS)', 'Content Management Systems (CMS)', 'Content-Management-Systeme (CMS)') },
        { name: l('Yapay Zekâ Destekli Dijital Ürün Geliştirme', 'AI-Assisted Digital Product Development', 'KI-gestützte Digitale Produktentwicklung') },
        { name: l('Temel API, Otomasyon & Teknik Test Deneyimi', 'Basic API, Automation & Technical Testing Experience', 'Grundkenntnisse in APIs, Automatisierung & technischen Tests') },
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
      titleLocalized: l('Kariyer Avcısı', 'Career Hunter', 'Karriere-Scout'),
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
      titleLocalized: l('Kişiye Özel Güvenli Belge Deposu', 'Personal Secure Document Vault', 'Persönlicher sicherer Dokumentenspeicher'),
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
    phone: '+4915228245042',
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