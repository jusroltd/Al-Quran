import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header className="header n-card container" data-testid="landing-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="brand-3d">AL QURAN</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/app" className="n-btn" data-testid="landing-open-app">Open App</Link>
          </div>
        </div>
      </header>

      <main className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
        <section className="n-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h1 data-testid="landing-title" style={{ margin: 0, fontSize: 42, lineHeight: '46px' }}>Quran Text &amp; Audio</h1>
            <p className="subtitle" data-testid="landing-subtitle">Read the Quran with translations, tafsir, and high‑quality recitations. Soft 3D neumorphic UI. Offline packs. 100+ reciters.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/app" className="n-btn" data-testid="get-started-btn">Get Started</Link>
              <a href="#features" className="n-btn" data-testid="view-features-btn">View Features</a>
            </div>
          </div>

          <div id="features" style={{ marginTop: 28, display: 'grid', gap: 12 }}>
            <div className="n-inset" style={{ padding: 16, borderRadius: 16 }} data-testid="feat-1">• 100+ Reciters with per‑ayah playback</div>
            <div className="n-inset" style={{ padding: 16, borderRadius: 16 }} data-testid="feat-2">• In‑surah search, repeat, A–B loop, auto‑scroll</div>
            <div className="n-inset" style={{ padding: 16, borderRadius: 16 }} data-testid="feat-3">• Offline packs with queue &amp; cache meter</div>
            <div className="n-inset" style={{ padding: 16, borderRadius: 16 }} data-testid="feat-4">• Neumorphic design with Arabic typography</div>
          </div>
        </section>

        <aside className="n-card" style={{ padding: 0, overflow: 'hidden' }}>
          <img alt="islamic-hero" data-testid="landing-hero-img" src="https://images.unsplash.com/photo-1680153120659-d36c692a7083" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(20%) brightness(1.05)' }} />
        </aside>
      </main>

      <section className="container" style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
        <div className="n-card" style={{ padding: 18 }}>
          <img alt="pattern" src="https://images.unsplash.com/photo-1603522456939-a52d4adda873" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 12, filter: 'grayscale(40%) opacity(0.8)' }} />
          <div className="subtitle" style={{ marginTop: 10 }}>Subtle geometry for calm focus</div>
        </div>
        <div className="n-card" style={{ padding: 18 }}>
          <img alt="calligraphy" src="https://images.unsplash.com/photo-1601480905449-90fca867ad37" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 12, filter: 'grayscale(30%) opacity(0.85)' }} />
          <div className="subtitle" style={{ marginTop: 10 }}>Respectful calligraphy accents</div>
        </div>
        <div className="n-card" style={{ padding: 18 }}>
          <div className="subtitle">Install as PWA and read offline. Queue audio for your favorite reciter and enjoy smooth, continuous listening on any device.</div>
        </div>
      </section>

      <footer className="container" style={{ marginTop: 28, marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="subtitle">© {new Date().getFullYear()} Quran Neumorph</div>
        <Link to="/app" className="n-btn" data-testid="footer-cta">Start Reading</Link>
      </footer>
    </div>
  );
}