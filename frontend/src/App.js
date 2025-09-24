/* App.js rebuilt to include Landing and lazy-loaded SurahPage while keeping SurahListPage and Header here */
import { useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft } from "lucide-react";
import Landing from "./pages/Landing.jsx";
import { Logo3D } from "./components/Logo3D";

const SurahPage = lazy(() => import('./pages/SurahPage.jsx'));

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function useApi() {
  const api = useMemo(() => {
    const instance = axios.create({ baseURL: API });
    return instance;
  }, []);
  return api;
}

function Header() {
  const navigate = useNavigate();
  return (
    <div className="header n-card container" data-testid="app-header">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button aria-label="Back" className="n-btn icon-btn" data-testid="nav-back-button" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} />
        </button>
        <Link to="/" className="hidden-border" data-testid="brand-link" style={{ textDecoration: "none", color: "inherit", display:'flex', alignItems:'center', gap:8 }}>
          <Logo3D size={24} dataTestId="logo-3d-app" />
          <strong className="brand-3d">AL QURAN</strong>
        </Link>
      </div>
    </div>
  );
}

function SurahListPage() {
  const api = useApi();
  const [surahs, setSurahs] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/quran/surahs");
        if (mounted) setSurahs(Array.isArray(data) ? data : data?.data || []);
      } catch (e) {
        console.error("Failed to load surahs", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [api]);

  const filtered = useMemo(() => {
    return surahs.filter((s) => {
      const hay = `${s.englishName} ${s.name} ${s.englishNameTranslation}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [surahs, q]);

  return (
    <div className="container" data-testid="surah-list-page">
      <div className="n-inset search" style={{ borderRadius: 18, marginBottom: 16 }}>
        <input
          className="input"
          placeholder="Search surah..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          data-testid="surah-search-input"
        />
      </div>

      {loading ? (
        <div className="grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="n-card surah-card skeleton" data-testid={`surah-card-skel-${i}`}
              style={{ height: 110 }}></div>
          ))}
        </div>
      ) : (
        <div className="grid">
          {filtered.map((s) => (
            <Link to={`/surah/${s.number}`} key={s.number} className="n-card surah-card" data-testid={`surah-card-${s.number}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="badge" aria-label="surah-meta">
                <span>#{s.number}</span>
                <span>Ayat {s.numberOfAyahs}</span>
                <span>{s.revelationType}</span>
              </div>
              <div className="surah-title">{s.englishName}</div>
              <div className="subtitle">{s.englishNameTranslation}</div>
              <div className="arabic">{s.name}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<><Header /><SurahListPage /></>} />
          <Route path="/surah/:number" element={<><Header /><Suspense fallback={<div className="container">Loading…</div>}><SurahPage /></Suspense></>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;