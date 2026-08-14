'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './page.module.css';

type Card = {
  q: string;
  tr: string;
  a: string;
  atr: string;
  tag?: string;
  tip?: string;
};

const cards: Card[] = [
  {
    q: 'Erzählen Sie bitte etwas über sich.',
    tr: 'Lütfen kendinizden biraz bahsedin.',
    a: 'Ich heiße Yalçın Mutlu. Ich habe viele Jahre als technischer Projektmanager gearbeitet. Ich habe Teams organisiert und viel Kontakt mit Kunden gehabt. Jetzt suche ich eine langfristige Arbeit in Deutschland.',
    atr: 'Benim adım Yalçın Mutlu. Uzun yıllar teknik proje yöneticisi olarak çalıştım. Ekipleri organize ettim ve müşterilerle çok iletişimim oldu. Şimdi Almanya’da uzun vadeli bir iş arıyorum.',
    tag: 'TEMEL',
  },
  {
    q: 'Warum ausgerechnet Transdev Vertrieb?',
    tr: 'Neden özellikle Transdev Vertrieb?',
    a: 'Transdev ist ein großes Unternehmen im öffentlichen Verkehr. Ich arbeite gerne mit Menschen. Ich suche eine langfristige Arbeit und finde diese Stelle interessant.',
    atr: 'Transdev toplu taşımada büyük bir şirket. İnsanlarla çalışmayı seviyorum. Uzun vadeli bir iş arıyorum ve bu pozisyonu ilginç buluyorum.',
    tag: 'GERÇEK ADAY SORUSU',
  },
  {
    q: 'Welche Erfahrungen haben Sie gesammelt?',
    tr: 'Hangi deneyimleri edindiniz?',
    a: 'Ich habe Erfahrung mit Kunden, Teamarbeit und Verantwortung. Bei Webrano hatte ich Kontakt mit vielen Kunden. Bei Mutlu Akustik habe ich ein technisches Team organisiert.',
    atr: 'Müşteri iletişimi, ekip çalışması ve sorumluluk konusunda deneyimim var. Webrano’da çok sayıda müşteriyle iletişimim oldu. Mutlu Akustik’te teknik bir ekibi organize ettim.',
    tag: 'GERÇEK ADAY SORUSU',
  },
  {
    q: 'Warum möchten Sie als Prüfpersonal arbeiten?',
    tr: 'Neden kontrol personeli olarak çalışmak istiyorsunuz?',
    a: 'Ich arbeite gerne mit Menschen und bin gerne unterwegs. Ich kann Verantwortung übernehmen. Deshalb passt die Stelle gut zu mir.',
    atr: 'İnsanlarla çalışmayı ve hareket halinde olmayı seviyorum. Sorumluluk alabilirim. Bu yüzden bu iş bana uygun.',
    tag: 'TEMEL',
  },
  {
    q: 'Warum sollten wir Sie einstellen?',
    tr: 'Neden sizi işe almalıyız?',
    a: 'Ich bin zuverlässig, ruhig und verantwortungsbewusst. Ich habe viel Berufserfahrung und lerne schnell.',
    atr: 'Güvenilir, sakin ve sorumluluk sahibi biriyim. Çok iş deneyimim var ve hızlı öğrenirim.',
    tag: 'TEMEL',
  },
  {
    q: 'Was machen Sie, wenn ein Fahrgast kein gültiges Ticket hat?',
    tr: 'Bir yolcunun geçerli bileti yoksa ne yaparsınız?',
    a: 'Ich bleibe freundlich und ruhig. Ich erkläre die Situation und die Regeln. Dann arbeite ich nach den Regeln von Transdev.',
    atr: 'Nazik ve sakin kalırım. Durumu ve kuralları açıklarım. Sonra Transdev’in kurallarına göre hareket ederim.',
    tag: 'YOLCU',
  },
  {
    q: 'Was machen Sie bei einem aggressiven Fahrgast?',
    tr: 'Agresif bir yolcuyla karşılaşırsanız ne yaparsınız?',
    a: 'Ich bleibe ruhig und freundlich. Ich möchte keinen Streit. Wenn die Situation gefährlich wird, hole ich Hilfe.',
    atr: 'Sakin ve nazik kalırım. Tartışma istemem. Durum tehlikeli olursa yardım isterim.',
    tag: 'ÇOK ÖNEMLİ',
    tip: 'ruhig • freundlich • keinen Streit • Hilfe holen',
  },
  {
    q: 'Was machen Sie, wenn ein Fahrgast Sie beleidigt?',
    tr: 'Bir yolcu size hakaret ederse ne yaparsınız?',
    a: 'Ich bleibe professionell und nehme es nicht persönlich. Ich versuche, die Situation ruhig zu lösen. Bei Gefahr hole ich Hilfe.',
    atr: 'Profesyonel kalırım ve kişisel algılamam. Durumu sakin şekilde çözmeye çalışırım. Tehlike olursa yardım isterim.',
    tag: 'YOLCU',
  },
  {
    q: 'Was bedeutet guter Kundenservice für Sie?',
    tr: 'Sizin için iyi müşteri hizmeti ne demektir?',
    a: 'Freundlich sein, zuhören und helfen. Der Fahrgast soll eine klare und richtige Antwort bekommen.',
    atr: 'Nazik olmak, dinlemek ve yardımcı olmak. Yolcu açık ve doğru bir cevap almalıdır.',
    tag: 'MÜŞTERİ',
  },
  {
    q: 'Ein Fahrgast fragt nach einer Verbindung. Was machen Sie?',
    tr: 'Bir yolcu bağlantı veya aktarma soruyor. Ne yaparsınız?',
    a: 'Ich helfe freundlich. Wenn ich die Antwort nicht weiß, prüfe ich die Information. Ich möchte eine richtige Antwort geben.',
    atr: 'Nazikçe yardımcı olurum. Cevabı bilmiyorsam bilgiyi kontrol ederim. Doğru cevap vermek isterim.',
    tag: 'MÜŞTERİ',
  },
  {
    q: 'Was sind Ihre Stärken?',
    tr: 'Güçlü yönleriniz nelerdir?',
    a: 'Ich bin zuverlässig, ruhig und verantwortungsbewusst. Auch bei Stress kann ich konzentriert arbeiten.',
    atr: 'Güvenilir, sakin ve sorumluluk sahibiyim. Stres altında da konsantre çalışabilirim.',
    tag: 'KİŞİLİK',
  },
  {
    q: 'Wie gehen Sie mit Stress um?',
    tr: 'Stresle nasıl başa çıkarsınız?',
    a: 'Ich bleibe ruhig und arbeite Schritt für Schritt. Ich setze Prioritäten und konzentriere mich auf meine Aufgabe.',
    atr: 'Sakin kalırım ve adım adım çalışırım. Öncelikleri belirler ve işime odaklanırım.',
    tag: 'KİŞİLİK',
  },
  {
    q: 'Können Sie im Schichtdienst, nachts und am Wochenende arbeiten?',
    tr: 'Vardiyalı, gece ve hafta sonu çalışabilir misiniz?',
    a: 'Ja. Ich weiß, dass Schichtarbeit zu diesem Beruf gehört. Das ist für mich in Ordnung.',
    atr: 'Evet. Vardiyalı çalışmanın bu işin bir parçası olduğunu biliyorum. Benim için sorun değil.',
    tag: 'İŞ ŞARTI',
    tip: 'Bu cevap yalnızca gerçekten uygunsa kullanılmalı.',
  },
  {
    q: 'Wie sind Ihre Deutschkenntnisse?',
    tr: 'Almancanız nasıl?',
    a: 'Mein Deutsch ist auf B1-Niveau. Ich lerne weiter und verbessere mein Deutsch jeden Tag.',
    atr: 'Almancam B1 seviyesinde. Öğrenmeye devam ediyorum ve Almancamı her gün geliştiriyorum.',
    tag: 'DİL',
  },
  {
    q: 'Was ist Ihre Schwäche?',
    tr: 'Zayıf yönünüz nedir?',
    a: 'Mein Deutsch ist noch nicht perfekt. Aber ich lerne jeden Tag und werde immer besser.',
    atr: 'Almancam henüz mükemmel değil. Ama her gün öğreniyorum ve giderek daha iyi oluyorum.',
    tag: 'KİŞİLİK',
  },
  {
    q: 'Wo sehen Sie sich in einigen Jahren?',
    tr: 'Kendinizi birkaç yıl sonra nerede görüyorsunuz?',
    a: 'Ich möchte zuerst die Arbeit gut lernen. Später möchte ich mich bei Transdev weiterentwickeln.',
    atr: 'Önce işi iyi öğrenmek istiyorum. Daha sonra Transdev içinde kendimi geliştirmek istiyorum.',
    tag: 'GELECEK',
  },
  {
    q: 'Wenn Sie eine Frage nicht verstehen ...',
    tr: 'Soruyu anlamadığınızda ne söyleyebilirsiniz?',
    a: 'Können Sie die Frage bitte wiederholen?\n\nKönnen Sie bitte etwas langsamer sprechen?',
    atr: 'Soruyu lütfen tekrar edebilir misiniz?\n\nBiraz daha yavaş konuşabilir misiniz?',
    tag: 'KURTARICI',
  },
  {
    q: 'Haben Sie noch Fragen an uns?',
    tr: 'Bize sormak istediğiniz bir şey var mı?',
    a: 'Wie sieht die Einarbeitung aus?\n\nAuf welchen Strecken werde ich hauptsächlich arbeiten?',
    atr: 'Eğitim / işe alışma süreci nasıl?\n\nAğırlıklı olarak hangi hatlarda çalışacağım?',
    tag: 'SEN SOR',
  },
];

export default function StudyDeck() {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const current = cards[index];

  const progress = useMemo(() => ((index + 1) / cards.length) * 100, [index]);

  const goNext = () => {
    setIndex((i) => (i + 1) % cards.length);
  };

  const goPrev = () => {
    setIndex((i) => (i - 1 + cards.length) % cards.length);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') goNext();
      if (event.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>TRANSDEV • PRÜFPERSONAL</p>
          <h1>Görüşme Çalışması</h1>
        </div>
        <span className={styles.counter}>{index + 1}/{cards.length}</span>
      </header>

      <div className={styles.progressTrack} aria-hidden="true">
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      </div>

      <section
        className={styles.stage}
        onTouchStart={(e) => { startX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (startX.current === null) return;
          const dx = e.changedTouches[0].clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) < 45) return;
          if (dx > 0) goNext();
          else goPrev();
        }}
      >
        <article className={styles.studyCard}>
          <div className={styles.cardHead}>
            <span className={styles.tag}>{current.tag}</span>
            <span className={styles.swipeHint}>← / →</span>
          </div>

          <div className={styles.questionBlock}>
            <p className={styles.questionLabel}>SORU</p>
            <h2>{current.q}</h2>
            <p className={styles.questionTr}>{current.tr}</p>
          </div>

          <div className={`${styles.answerPanel} ${styles.answerVisible}`}>
            <p className={styles.answerLabel}>B1 ALMANCA CEVAP</p>
            <p className={styles.answerDe}>{current.a}</p>
            <div className={styles.divider} />
            <p className={styles.answerLabel}>TÜRKÇESİ</p>
            <p className={styles.answerTr}>{current.atr}</p>
            {current.tip && <p className={styles.tip}>{current.tip}</p>}
          </div>
        </article>
      </section>

      <nav className={styles.controls} aria-label="Kart kontrolleri">
        <button onClick={goPrev} aria-label="Önceki soru">← Önceki</button>
        <button onClick={goNext} aria-label="Sonraki soru">Sonraki →</button>
      </nav>

      <p className={styles.mobileHint}>Sağa kaydır: sonraki • Sola kaydır: önceki</p>
    </main>
  );
}
