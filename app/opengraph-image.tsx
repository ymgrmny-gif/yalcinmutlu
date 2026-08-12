import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const alt = 'Yalçın Mutlu — Persönliches Portfolio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '84px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 58%, #334155 100%)',
          color: '#f8fafc',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 3, textTransform: 'uppercase', color: '#cbd5e1', marginBottom: 24 }}>
          Persönliches Portfolio
        </div>
        <div style={{ fontSize: 82, fontWeight: 700, lineHeight: 1.05, marginBottom: 28 }}>Yalçın Mutlu</div>
        <div style={{ fontSize: 34, lineHeight: 1.35, color: '#e2e8f0', maxWidth: 920 }}>
          Service & Betrieb · Technischer Kundendienst · Projekt- und Einsatzkoordination
        </div>
      </div>
    ),
    size,
  );
}
