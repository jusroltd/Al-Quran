import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Play, Pause, ChevronLeft } from "lucide-react";
import { Slider } from "./components/ui/slider";
import { Switch } from "./components/ui/switch";

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
        <Link to="/" className="hidden-border" data-testid="brand-link" style={{ textDecoration: "none", color: "inherit" }}>
          <strong>Quran • Neumorph</strong>
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

function useAudio() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [src, setSrc] = useState("");
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const load = (url) => {
    if (!audioRef.current) audioRef.current = new Audio();
    if (src !== url) {
      setSrc(url);
      audioRef.current.src = url;
      audioRef.current.playbackRate = speed;
    }
  };

  const play = async () => {
    try {
      await audioRef.current.play();
      setPlaying(true);
    } catch (e) {
      console.warn("autoplay blocked", e);
    }
  };

  const pause = () => {
    audioRef.current.pause();
    setPlaying(false);
  };

  return { audioRef, load, play, pause, playing, src, speed, setSpeed };
}

function highlight(text, q) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + q.length);
  const after = text.slice(idx + q.length);
  return (<span>{before}<mark>{match}</mark>{after}</span>);
}

function SurahPage() {
  const api = useApi();
  const { number } = useParams();
  const [arabic, setArabic] = useState(null);
  const [english, setEnglish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentAyah, setCurrentAyah] = useState(null);
  const [query, setQuery] = useState("");
  const firstMatchRef = useRef(null);
  const { load, play, pause, playing, src, speed, setSpeed } = useAudio();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const [{ data: en }, { data: ar }] = await Promise.all([
          api.get(`/quran/surah/${number}?edition=en.asad`),
          api.get(`/quran/surah/${number}/arabic?edition=quran-uthmani`),
        ]);
        if (!mounted) return;
        setEnglish(en?.data);
        setArabic(ar?.data);
      } catch (e) {
        console.error("Failed to load surah", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [api, number]);

  const onPlayAyah = (ayah) => {
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;
    load(audioUrl);
    play();
    setCurrentAyah(ayah.numberInSurah);
  };

  const toggle = () => { if (playing) pause(); else play(); };

  const matches = useMemo(() => {
    if (!english?.ayahs) return [];
    if (!query) return english.ayahs.map((a) => a.numberInSurah);
    const ql = query.toLowerCase();
    return english.ayahs.filter(a => a.text.toLowerCase().includes(ql)).map(a => a.numberInSurah);
  }, [english, query]);

  useEffect(() => {
    if (firstMatchRef.current) {
      firstMatchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [query]);

  return (
    <div className="container" data-testid="surah-page">
      {loading || !arabic || !english ? (
        <div className="n-card" style={{ padding: 18 }} data-testid="surah-skeleton">
          Loading surah...
        </div>
      ) : (
        <div className="n-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div className="surah-title" data-testid="surah-name">{english.englishName} · {arabic.name}</div>
              <div className="subtitle" data-testid="surah-meta">{english.englishNameTranslation} · {english.revelationType} · {english.numberOfAyahs} ayat</div>
            </div>
            <Link to="/" className="n-btn" data-testid="back-to-list">Back</Link>
          </div>

          <div className="n-inset search" style={{ borderRadius: 18, marginBottom: 12 }}>
            <input
              className="input"
              placeholder="Search within surah..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              data-testid="in-surah-search-input"
            />
            <div className="subtitle" data-testid="in-surah-match-count">{matches.length} matches</div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {english.ayahs.map((enAyah, i) => {
              const isMatch = matches.includes(enAyah.numberInSurah);
              if (query && !isMatch) return null;
              const arAyah = arabic.ayahs[i];
              const active = currentAyah === enAyah.numberInSurah;
              const refProp = (query && isMatch && !firstMatchRef.current) ? { ref: firstMatchRef } : {};
              return (
                <div key={enAyah.number} {...refProp} className={`n-inset ayah ${active ? 'skeleton' : ''}`} data-testid={`ayah-${enAyah.numberInSurah}`}>
                  <div className="row">
                    <div>
                      <div className="arabic" dir="rtl">{arAyah.text}</div>
                      <div style={{ height: 8 }} />
                      <div>{highlight(enAyah.text, query)}</div>
                      <div className="subtitle">Ayah {enAyah.numberInSurah}</div>
                    </div>
                    <div>
                      <button className="n-btn icon-btn" data-testid={`ayah-play-${enAyah.numberInSurah}`} onClick={() => onPlayAyah(enAyah)} aria-label="Play ayah">
                        <Play size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {src ? (
        <div className="n-card player" data-testid="mini-player">
          <button className="n-btn icon-btn" onClick={toggle} data-testid="mini-player-toggle">
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <div className="subtitle" style={{ minWidth: 160 }}>{playing ? 'Playing' : 'Paused'} · Mishary Al-Afasy</div>
          <div style={{ width: 160 }}>
            <div className="subtitle" style={{ marginBottom: 6 }}>Speed {speed.toFixed(1)}x</div>
            <Slider
              data-testid="speed-slider"
              min={0.5}
              max={2}
              step={0.1}
              value={[speed]}
              onValueChange={(v) => setSpeed(v[0])}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<SurahListPage />} />
          <Route path="/surah/:number" element={<SurahPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;