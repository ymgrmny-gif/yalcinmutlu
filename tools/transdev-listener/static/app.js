(() => {
  const params = new URLSearchParams(location.search);
  const token = params.get('token') || '';
  const statusEl = document.getElementById('status');
  const transcriptEl = document.getElementById('transcript');
  const translationEl = document.getElementById('translation');
  const answerEl = document.getElementById('answer');
  const sourceEl = document.getElementById('source');
  const confidenceEl = document.getElementById('confidence');
  const connectionEl = document.getElementById('connection');

  const setText = (el, text, empty) => {
    el.textContent = text || empty;
    el.classList.toggle('muted', !text);
  };

  const render = (s) => {
    statusEl.querySelector('span:last-child').textContent = s.status || 'Hazır';
    statusEl.classList.toggle('online', Boolean(s.connected));
    setText(transcriptEl, s.transcript_de, 'Konuşma bekleniyor…');
    setText(translationEl, s.translation_tr, '—');
    setText(answerEl, s.answer_de, 'Soru anlaşılır anlaşılmaz kısa B1 cevap burada görünecek.');
    sourceEl.textContent = s.answer_source || '—';
    sourceEl.dataset.source = (s.answer_source || '').toLowerCase();
    confidenceEl.textContent = s.match_score ? `Hazır soru eşleşmesi: %${Math.round(s.match_score * 100)}` : '';
    if (s.last_error) connectionEl.textContent = s.last_error;
  };

  if (!token) {
    connectionEl.textContent = 'Oturum tokenı eksik.';
    statusEl.querySelector('span:last-child').textContent = 'Bağlanamadı';
    return;
  }

  let retry = 0;
  const connect = () => {
    const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${scheme}://${location.host}/ws?token=${encodeURIComponent(token)}`);
    ws.onopen = () => {
      retry = 0;
      connectionEl.textContent = 'PC listener bağlı';
      document.body.classList.add('connected');
    };
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'state') render(payload.state || {});
      } catch (_) {}
    };
    ws.onclose = () => {
      document.body.classList.remove('connected');
      connectionEl.textContent = 'Bağlantı koptu, tekrar bağlanıyor…';
      const wait = Math.min(5000, 500 + 500 * retry++);
      setTimeout(connect, wait);
    };
    ws.onerror = () => ws.close();
  };

  connect();
})();
