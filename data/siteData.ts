export type SectionId = 'profile' | 'education' | 'experience' | 'skills' | 'projects' | 'contact';

export const siteData = {
  name: 'Yalçın Mutlu',
  eyebrow: 'Kişisel Portföy',
  role: 'CV • Deneyim • Projeler',
  intro:
    'Bu ilk sürüm, kişisel bilgiler ve içerikler sonradan kolayca güncellenebilecek şekilde hazırlandı. Timeline, sayfa kaydırıldıkça canlı olarak ilerler.',
  tagline: 'Fikirden uygulamaya; sade, anlaşılır ve işe yarayan işler.',
  cvHref: '',
  profileImage: '/images/yalcin-mutlu-profile.webp',
  details: [
    { label: 'Ad Soyad', value: 'Yalçın Mutlu', icon: 'user' },
    { label: 'Konum', value: 'Bilgi eklenecek', icon: 'location' },
    { label: 'E-posta', value: 'email@alanadi.com', icon: 'email' },
    { label: 'Telefon', value: 'Bilgi eklenecek', icon: 'phone' },
    { label: 'Web', value: 'alanadi.com', icon: 'web' },
    { label: 'Durum', value: 'Yeni fırsatlara açık', icon: 'briefcase' },
  ],
  education: [
    {
      period: '20XX — 20XX',
      title: 'Eğitim bilgisi',
      place: 'Kurum / Üniversite',
      description: 'Bölüm, derece ve önemli detaylar sonraki aşamada eklenecek.',
    },
    {
      period: '20XX — 20XX',
      title: 'Ek eğitim / sertifika',
      place: 'Kurum',
      description: 'İkinci eğitim kaydı için hazır alan.',
    },
  ],
  experience: [
    {
      period: '20XX — Günümüz',
      title: 'Pozisyon / Rol',
      place: 'Şirket / Kurum',
      description: 'Rol, sorumluluk ve ölçülebilir sonuçlar burada gösterilecek.',
    },
    {
      period: '20XX — 20XX',
      title: 'Önceki Pozisyon',
      place: 'Şirket / Kurum',
      description: 'Önceki deneyim için ikinci kayıt alanı.',
    },
  ],
  skills: [
    { name: 'İletişim', level: 88 },
    { name: 'Araştırma', level: 92 },
    { name: 'Proje Yönetimi', level: 84 },
    { name: 'Dijital Araçlar', level: 80 },
    { name: 'İçerik Üretimi', level: 86 },
    { name: 'Problem Çözme', level: 90 },
  ],
  projects: [
    { number: '01', title: 'Proje Başlığı', category: 'Kişisel Proje', description: 'Kısa proje açıklaması ve kullanılan yaklaşım.' },
    { number: '02', title: 'Proje Başlığı', category: 'Araştırma', description: 'İkinci proje için açıklama alanı.' },
    { number: '03', title: 'Proje Başlığı', category: 'Dijital Ürün', description: 'Üçüncü proje için açıklama alanı.' },
    { number: '04', title: 'Proje Başlığı', category: 'Seçili Çalışma', description: 'Dördüncü proje için açıklama alanı.' },
  ],
  contact: {
    email: 'email@alanadi.com',
    phone: 'Bilgi eklenecek',
    location: 'Bilgi eklenecek',
    website: 'alanadi.com',
  },
  social: {
    linkedin: '',
    github: '',
    instagram: '',
  },
} as const;

export const navItems: { id: SectionId; label: string }[] = [
  { id: 'profile', label: 'Profil' },
  { id: 'education', label: 'Eğitim' },
  { id: 'experience', label: 'Deneyim' },
  { id: 'skills', label: 'Yetkinlikler' },
  { id: 'projects', label: 'Projeler' },
  { id: 'contact', label: 'İletişim' },
];
