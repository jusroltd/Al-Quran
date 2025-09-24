import { Link } from "react-router-dom";
import { Logo3D } from "../components/Logo3D";

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header className="header n-card container" data-testid="landing-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Logo3D size={32} dataTestId="logo-3d-header" />
            <div className="brand-3d">AL QURAN</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/app" className="n-btn" data-testid="landing-open-app">Open App</Link>
          </div>
        </div>
      </header>

      <main className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
        <section className="n-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <Logo3D size={56} dataTestId="logo-3d-hero" />
              <h1 data-testid="landing-title" className="brand-3d-lg" style={{ margin: 0, fontSize: 48, lineHeight: '50px' }}>AL QURAN</h1>
            </div>
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
            <div className="n-inset" style={{ padding: 16, borderRadius: 16 }} data-testid="feat-4"><span className="brand-3d">• Neumorphic design with Arabic typography</span></div>
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

      <footer className="container" style={{ marginTop: 28, marginBottom: 28, display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center' }}>
        <div>
          <div className="brand-3d" data-testid="footer-copy">© 2025 AL Quran created with by uthuman inc  all rights reserved to uthuman & co </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }} data-testid="footer-developer">
            <span className="brand-3d">Developer: Uthuman Mudde</span>
            <span title="Verified" data-testid="footer-verified-icon" aria-label="Verified badge">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' }}>
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <path d="M11.5283 1.5999C11.7686 1.29437 12.2314 1.29437 12.4717 1.5999L14.2805 3.90051C14.4309 4.09173 14.6818 4.17325 14.9158 4.10693L17.7314 3.3089C18.1054 3.20292 18.4799 3.475 18.4946 3.86338L18.6057 6.78783C18.615 7.03089 18.77 7.24433 18.9984 7.32823L21.7453 8.33761C22.1101 8.47166 22.2532 8.91189 22.0368 9.23478L20.4078 11.666C20.2724 11.8681 20.2724 12.1319 20.4078 12.334L22.0368 14.7652C22.2532 15.0881 22.1101 15.5283 21.7453 15.6624L18.9984 16.6718C18.77 16.7557 18.615 16.9691 18.6057 17.2122L18.4946 20.1366C18.4799 20.525 18.1054 20.7971 17.7314 20.6911L14.9158 19.8931C14.6818 19.8267 14.4309 19.9083 14.2805 20.0995L12.4717 22.4001C12.2314 22.7056 11.7686 22.7056 11.5283 22.4001L9.71949 20.0995C9.56915 19.9083 9.31823 19.8267 9.08421 19.8931L6.26856 20.6911C5.89463 20.7971 5.52014 20.525 5.50539 20.1366L5.39427 17.2122C5.38503 16.9691 5.22996 16.7557 5.00164 16.6718L2.25467 15.6624C1.88986 15.5283 1.74682 15.0881 1.96317 14.7652L3.59221 12.334C3.72761 12.1319 3.72761 11.8681 3.59221 11.666L1.96317 9.23478C1.74682 8.91189 1.88986 8.47166 2.25467 8.33761L5.00165 7.32823C5.22996 7.24433 5.38503 7.03089 5.39427 6.78783L5.50539 3.86338C5.52014 3.475 5.89463 3.20292 6.26857 3.3089L9.08421 4.10693C9.31823 4.17325 9.56915 4.09173 9.71949 3.90051L11.5283 1.5999Z" stroke="#000000" strokeWidth="1.5"></path>
                  <path d="M9 12L11 14L15 10" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                </g>
              </svg>
            </span>
          </div>
        </div>
        <Link to="/app" className="n-btn" data-testid="footer-cta">Start Reading</Link>
      </footer>
    </div>
  );
}