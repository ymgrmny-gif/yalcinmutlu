import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Transdev Görüşme Çalışması | Yalçın Mutlu',
  description: 'Transdev Prüfpersonal Tübingen için kısa B1 Almanca mülakat çalışma sayfası.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

type QA = {
  q: string;
  tr: string;
  a: string;
  atr: string;
  real?: boolean;
  tip?: string;
};

const core: QA[] = [
  {
    q: 'Erzählen Sie bitte etwas über sich.',
    tr: 'Lütfen kendinizden biraz bahsedin.',
    a: 'Ich heiße Yalçın Mutlu. Ich habe viele Jahre als technischer Projektmanager gearbeitet. Ich habe Teams organisiert und viel Kontakt mit Kunden gehabt. Jetzt suche ich eine neue, langfristige Arbeit in Deutschland.',
    atr: 'Benim adım Yalçın Mutlu. Uzun yıllar teknik proje yöneticisi olarak çalıştım. Ekipleri organize ettim ve müşterilerle çok iletişimim oldu. Şimdi Almanya’da yeni ve uzun vadeli bir iş arıyorum.',
  },
  {
    q: 'Warum ausgerechnet Transdev Vertrieb?',
    tr: 'Neden özellikle Transdev Vertrieb?',
    a: 'Transdev ist ein großes Unternehmen im öffentlichen Verkehr. Ich arbeite gerne mit Menschen und möchte eine langfristige Arbeit. Die Stelle finde ich interessant, weil sie Kundenkontakt und Verantwortung verbindet.',
    atr: 'Transdev toplu taşımada büyük bir şirket. İnsanlarla çalışmayı seviyorum ve uzun vadeli bir iş istiyorum. Bu işi, müşteri iletişimi ile sorumluluğu birleştirdiği için ilginç buluyorum.',
    real: true,
    tip: 'Aynı Tübingen Prüfpersonal pozisyonuna başvuran bir adayın bildirdiği gerçek sorulardan biri.',
  },
  {
    q: 'Welche Erfahrungen haben Sie gesammelt?',
    tr: 'Hangi deneyimleri edindiniz?',
    a: 'Ich habe Erfahrung mit Kunden, Teamarbeit und Verantwortung. Bei Webrano hatte ich Kontakt mit vielen Kunden. Bei Mutlu Akustik habe ich ein technisches Team organisiert und Projekte geplant.',
    atr: 'Müşteri iletişimi, ekip çalışması ve sorumluluk konusunda deneyimim var. Webrano’da çok sayıda müşteriyle iletişimim oldu. Mutlu Akustik’te teknik bir ekibi organize ettim ve projeler planladım.',
    real: true,
    tip: 'Bu da aynı pozisyon için bir adayın bildirdiği gerçek sorulardan biri.',
  },
  {
    q: 'Warum möchten Sie als Prüfpersonal arbeiten?',
    tr: 'Neden kontrol personeli olarak çalışmak istiyorsunuz?',
    a: 'Ich arbeite gerne mit Menschen und bin gerne unterwegs. Ich kann Verantwortung übernehmen und ruhig arbeiten. Deshalb passt die Stelle gut zu mir.',
    atr: 'İnsanlarla çalışmayı seviyorum ve hareket halinde olmayı seviyorum. Sorumluluk alabilirim ve sakin çalışabilirim. Bu yüzden bu iş bana uygun.',
  },
  {
    q: 'Warum sollten wir Sie einstellen?',
    tr: 'Neden sizi işe almalıyız?',
    a: 'Ich bin zuverlässig, ruhig und verantwortungsbewusst. Ich habe viel Berufserfahrung und lerne schnell. Ich möchte langfristig bei Transdev arbeiten.',
    atr: 'Güvenilir, sakin ve sorumluluk sahibi biriyim. Çok iş deneyimim var ve hızlı öğrenirim. Transdev’de uzun vadeli çalışmak istiyorum.',
  },
];

const situations: QA[] = [
  {
    q: 'Was machen Sie, wenn ein Fahrgast kein gültiges Ticket hat?',
    tr: 'Bir yolcunun geçerli bileti yoksa ne yaparsınız?',
    a: 'Ich bleibe freundlich und ruhig. Ich erkläre die Situation und die Regeln. Dann arbeite ich nach den Regeln von Transdev.',
    atr: 'Nazik ve sakin kalırım. Durumu ve kuralları açıklarım. Sonra Transdev’in kurallarına göre hareket ederim.',
  },
  {
    q: 'Was machen Sie bei einem aggressiven Fahrgast?',
    tr: 'Agresif bir yolcuyla karşılaşırsanız ne yaparsınız?',
    a: 'Ich bleibe ruhig und freundlich. Ich möchte keinen Streit. Wenn die Situation gefährlich wird, hole ich Hilfe.',
    atr: 'Sakin ve nazik kalırım. Tartışma istemem. Durum tehlikeli olursa yardım isterim.',
    tip: 'Anahtar kelimeler: ruhig – freundlich – kein Streit – Hilfe holen.',
  },
  {
    q: 'Was machen Sie, wenn ein Fahrgast Sie beleidigt?',
    tr: 'Bir yolcu size hakaret ederse ne yaparsınız?',
    a: 'Ich bleibe professionell und nehme es nicht persönlich. Ich versuche, die Situation ruhig zu lösen. Bei Gefahr hole ich Hilfe.',
    atr: 'Profesyonel kalırım ve kişisel algılamam. Durumu sakin şekilde çözmeye çalışırım. Tehlike olursa yardım isterim.',
  },
  {
    q: 'Was bedeutet guter Kundenservice für Sie?',
    tr: 'Sizin için iyi müşteri hizmeti ne demektir?',
    a: 'Freundlich sein, zuhören und helfen. Der Fahrgast soll eine klare und richtige Antwort bekommen.',
    atr: 'Nazik olmak, dinlemek ve yardımcı olmak. Yolcu açık ve doğru bir cevap almalıdır.',
  },
  {
    q: 'Ein Fahrgast fragt nach einer Verbindung. Was machen Sie?',
    tr: 'Bir yolcu bağlantı/aktarma soruyor. Ne yaparsınız?',
    a: 'Ich helfe freundlich. Wenn ich die Antwort nicht weiß, prüfe ich die Information. Ich möchte eine richtige Antwort geben.',
    atr: 'Nazikçe yardımcı olurum. Cevabı bilmiyorsam bilgiyi kontrol ederim. Doğru cevap vermek isterim.',
  },
];

const work: QA[] = [
  {
    q: 'Was sind Ihre Stärken?',
    tr: 'Güçlü yönleriniz nelerdir?',
    a: 'Ich bin zuverlässig, ruhig und verantwortungsbewusst. Auch bei Stress kann ich konzentriert arbeiten.',
    atr: 'Güvenilir, sakin ve sorumluluk sahibiyim. Stres altında da konsantre çalışabilirim.',
  },
  {
    q: 'Wie gehen Sie mit Stress um?',
    tr: 'Stresle nasıl başa çıkarsınız?',
    a: 'Ich bleibe ruhig und arbeite Schritt für Schritt. Ich setze Prioritäten und konzentriere mich auf meine Aufgabe.',
    atr: 'Sakin kalırım ve adım adım çalışırım. Öncelikleri belirler ve işime odaklanırım.',
  },
  {
    q: 'Können Sie im Schichtdienst, nachts und am Wochenende arbeiten?',
    tr: 'Vardiyalı, gece ve hafta sonu çalışabilir misiniz?',
    a: 'Ja. Ich weiß, dass Schichtarbeit zu diesem Beruf gehört. Das ist für mich in Ordnung.',
    atr: 'Evet. Vardiyalı çalışmanın bu işin bir parçası olduğunu biliyorum. Benim için sorun değil.',
    tip: 'Bu gerçekten senin için uygunsa bu şekilde cevapla.',
  },
  {
    q: 'Wie sind Ihre Deutschkenntnisse?',
    tr: 'Almancanız nasıl?',
    a: 'Mein Deutsch ist auf B1-Niveau. Ich lerne weiter und verbessere mein Deutsch jeden Tag.',
    atr: 'Almancam B1 seviyesinde. Öğrenmeye devam ediyorum ve Almancamı her gün geliştiriyorum.',
  },
  {
    q: 'Was ist Ihre Schwäche?',
    tr: 'Zayıf yönünüz nedir?',
    a: 'Mein Deutsch ist noch nicht perfekt. Aber ich lerne jeden Tag und werde immer besser.',
    atr: 'Almancam henüz mükemmel değil. Ama her gün öğreniyorum ve giderek daha iyi oluyorum.',
  },
  {
    q: 'Wo sehen Sie sich in einigen Jahren?',
    tr: 'Kendinizi birkaç yıl sonra nerede görüyorsunuz?',
    a: 'Ich möchte zuerst die Arbeit gut lernen. Später möchte ich mich bei Transdev weiterentwickeln.',
    atr: 'Önce işi iyi öğrenmek istiyorum. Daha sonra Transdev içinde kendimi geliştirmek istiyorum.',
  },
];

function Card({ item, open = false }: { item: QA; open?: boolean }) {
  return (
    <details className={styles.card} open={open}>
      <summary>
        {item.real && <span className={styles.badge}>GERÇEK ADAY SORUSU</span>}
        <span className={styles.question}>{item.q}</span>
        <span className={styles.translation}>{item.tr}</span>
      </summary>
      <div className={styles.answerWrap}>
        <p className={styles.answerLabel}>Kısa B1 cevap</p>
        <p className={styles.answerDe}>{item.a}</p>
        <p className={styles.answerTr}><strong>Türkçesi:</strong> {item.atr}</p>
        {item.tip && <p className={styles.tip}>{item.tip}</p>}
      </div>
    </details>
  );
}

export default function TransdevInterviewPage() {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.shell}>
          <p className={styles.kicker}>Mülakat çalışma kartları</p>
          <h1 className={styles.title}>Transdev • Prüfpersonal</h1>
          <p className={styles.subtitle}>
            Tübingen’deki tren kontrol personeli görüşmesi için kısa, net ve B1 seviyesine uygun Almanca cevaplar. Kartı aç, Almanca cevabı sesli söyle, sonra Türkçesiyle kontrol et.
          </p>
          <div className={styles.meta}>
            <span className={styles.pill}>MS Teams</span>
            <span className={styles.pill}>B1 Almanca</span>
            <span className={styles.pill}>Tübingen</span>
            <span className={styles.pill}>Prüfpersonal im Zug</span>
          </div>
        </div>
      </header>

      <nav className={styles.nav} aria-label="Çalışma bölümleri">
        <div className={`${styles.shell} ${styles.navInner}`}>
          <a href="#temel">Temel sorular</a>
          <a href="#durum">Yolcu & çatışma</a>
          <a href="#is">İş & kişilik</a>
          <a href="#kaliplar">Kurtarıcı kalıplar</a>
          <a href="#sen-sor">Senin soruların</a>
        </div>
      </nav>

      <div className={styles.shell}>
        <section id="temel" className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Temel sorular</h2>
          <p className={styles.sectionLead}>Önce bu bölümdeki 5 cevabı rahat söyleyebilir hale gel.</p>
          {core.map((item, i) => <Card key={item.q} item={item} open={i === 0} />)}
        </section>

        <section id="durum" className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Yolcu ve çatışma soruları</h2>
          <p className={styles.sectionLead}>Bu iş için en önemli bölüm. Cevaplarda sakinlik, saygı ve güvenlik vurgusu yap.</p>
          {situations.map((item) => <Card key={item.q} item={item} />)}
        </section>

        <section id="is" className={styles.section}>
          <h2 className={styles.sectionTitle}>3. İş ve kişilik soruları</h2>
          <p className={styles.sectionLead}>Kısa cevap ver. Gereksiz uzun cümle kurmaya çalışma.</p>
          {work.map((item) => <Card key={item.q} item={item} />)}
        </section>

        <section id="kaliplar" className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Kurtarıcı Almanca kalıplar</h2>
          <div className={styles.cheat}>
            <h3>Soruyu anlamadığında</h3>
            <p><strong>Können Sie die Frage bitte wiederholen?</strong><br />Soruyu lütfen tekrar edebilir misiniz?</p>
            <p><strong>Können Sie bitte etwas langsamer sprechen?</strong><br />Biraz daha yavaş konuşabilir misiniz?</p>
            <p><strong>Habe ich Sie richtig verstanden?</strong><br />Sizi doğru mu anladım?</p>
            <p><strong>Einen Moment bitte. Ich muss kurz überlegen.</strong><br />Bir dakika lütfen. Kısaca düşünmem gerekiyor.</p>
          </div>
          <div className={styles.cheat}>
            <h3>Çatışma sorularının formülü</h3>
            <p><strong>ruhig bleiben → freundlich bleiben → Regeln erklären → keinen Streit → bei Gefahr Hilfe holen</strong></p>
            <p>Sakin kal → nazik kal → kuralları açıkla → tartışmaya girme → tehlike varsa yardım iste.</p>
          </div>
        </section>

        <section id="sen-sor" className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Görüşmenin sonunda sen sor</h2>
          <div className={styles.callout}>
            <strong>Wie sieht die Einarbeitung aus?</strong><br />Eğitim / işe alışma süreci nasıl?<br /><br />
            <strong>Auf welchen Strecken werde ich hauptsächlich arbeiten?</strong><br />Ağırlıklı olarak hangi hatlarda çalışacağım?
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Teams görüşmesine giriş</h2>
          <div className={styles.callout}>
            <strong>Guten Tag. Ja, ich kann Sie gut hören. Vielen Dank für die Einladung. Ich freue mich auf unser Gespräch.</strong><br /><br />
            Merhaba. Evet, sizi iyi duyabiliyorum. Davetiniz için çok teşekkür ederim. Görüşmemizi sabırsızlıkla bekliyordum / görüşmemize sevindim.
          </div>
        </section>

        <footer className={styles.footer}>
          <strong>Not:</strong> Bu çalışma sayfasındaki iş geçmişi, yalcinmutlu reposundaki mevcut CV/portföy verisine göre hazırlanmıştır. Mevcut sitede menü bağlantısı eklenmemiştir; sayfaya yalnızca doğrudan URL ile girilir.
        </footer>
      </div>
    </main>
  );
}
