import { useState } from 'react';
import type { RiskReport } from '../shared/types';

export function App() {
  const [report, setReport] = useState<RiskReport | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const page = await chrome.tabs.sendMessage(tabs[0].id!, { type: 'EXTRACT_PAGE' });
      const result = await chrome.runtime.sendMessage({ type: 'ANALYZE_PAGE', page });
      setReport(result);
    } catch (e) {
      const message = String(e);
      const unsupported = message.includes('Receiving end does not exist');
      setReport({
        status: 'error', score: null, label: 'Belirsiz', clauses: [],
        uncertainty: unsupported
          ? 'Bu sayfada içerik okuyucu çalışmıyor. Uzantıyı yeniden yükleyip sayfayı yenileyin; chrome://, Chrome Web Store ve yeni sekme sayfaları desteklenmez.'
          : 'Sayfa okunamadı.',
        rejectedUnverified: 0, hiddenContentDetected: false, injectionDetected: false,
        error: unsupported ? 'Content script bulunamadı. Sayfayı yenileyip tekrar deneyin.' : message
      });
    } finally {
      setLoading(false);
    }
  }

  const missingApiKey = report?.error === 'Gemini API anahtarı ayarlarda yok.';

  return <main>
    <header className="brand"><div className="brand-mark">✦</div><div><h1>Hukuk Metre</h1><p className="eyebrow">Sözleşmenizi daha iyi anlayın</p></div></header>
    <p className="disclaimer">Bu uygulama hukuki tavsiye vermez.</p>
    <button onClick={analyze} disabled={loading}>{loading ? 'Analiz ediliyor…' : 'Bu sayfayı analiz et'}</button>
    {report && <section>
      <h2>{report.label}{report.score !== null && ` — ${report.score}/100`}</h2>
      {report.status !== 'ready' && <p className="warning">Belirsiz: {report.uncertainty}</p>}
      {report.hiddenContentDetected && <p className="warning">Gizli içerik tespit edildi.</p>}
      {report.injectionDetected && <p className="warning">Injection benzeri talimat tespit edildi; skoru değiştiremez.</p>}
      <p>Doğrulanamayan ve çıkarılan madde: {report.rejectedUnverified}</p>
      {report.error && <p className="error">{report.error}</p>}
      {missingApiKey && <button onClick={() => chrome.runtime.openOptionsPage()}>Ayarları aç</button>}
      {report.clauses.map((c, i) => <article key={i}>
        <b>{c.category} · Şiddet {c.severity}/5</b>
        <p>{c.explanation}</p>
        <blockquote>“{c.quote}”</blockquote>
      </article>)}
    </section>}
  </main>;
}
