import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function Options() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-3.8-flash');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['apiKey', 'model']).then(x => {
      setApiKey(typeof x.apiKey === 'string' ? x.apiKey : '');
      setModel(typeof x.model === 'string' && x.model.trim() ? x.model : 'gemini-3.8-flash');
    });
  }, []);

  function save() {
    const cleanModel = model.trim() || 'gemini-3.8-flash';
    chrome.storage.local.set({ apiKey: apiKey.trim(), model: cleanModel }).then(() => {
      setApiKey(apiKey.trim()); setModel(cleanModel); setSaved(true);
    });
  }

  return <main>
    <header className="brand"><div className="brand-mark">✦</div><div><h1>Hukuk Metre</h1><p className="eyebrow">Güvenli analiz ayarları</p></div></header>
    <section className="settings-card">
      <h2>Gemini bağlantısı</h2>
      <p className="intro">Sayfa analizlerini çalıştırmak için Google AI Studio API anahtarınızı ekleyin.</p>
      <label>Gemini API anahtarı<input type="password" value={apiKey} onChange={e => { setApiKey(e.target.value); setSaved(false); }} autoComplete="off" placeholder="AIza…" /></label>
      <label>Gemini model adı<input value={model} onChange={e => { setModel(e.target.value); setSaved(false); }} placeholder="gemini-3.8-flash" /></label>
      <p className="hint">Önerilen model: <code>gemini-3.8-flash-lite</code></p>
      <button onClick={save}>Ayarları kaydet</button>
      {saved && <p className="saved">✓ Ayarlar kaydedildi.</p>}
    </section>
    <section className="info-card">
      <h2>Gizlilik</h2>
      <p>API anahtarınız yalnızca bu tarayıcıdaki yerel uzantı depolamasında tutulur. Özel veya hassas belgeleri analiz etmeyin.</p>
    </section>
  </main>;
}

createRoot(document.getElementById('root')!).render(<Options />);
