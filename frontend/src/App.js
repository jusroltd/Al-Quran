import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Play, Pause, ChevronLeft } from "lucide-react";
import { Slider } from "./components/ui/slider";
import { Switch } from "./components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "./components/ui/select";
import { Progress } from "./components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "./components/ui/avatar";

// Top 20 Reciters (name, avatar, provider, code or match hint)
const RECITERS = [
  { key: 'minshawi', name: 'Muhammad Siddiq Al-Minshawi', img: 'https://everyayah.com/data/status/128/minshawi.jpg', provider: 'everyayah', code: 'Minshawi_Murattal_128kbps' },
  { key: 'abdul-basit', name: 'Abdul Basit Abdul Samad', img: 'https://upload.wikimedia.org/wikipedia/commons/7/75/%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%A8%D8%A7%D8%B3%D8%B7_%D8%B9%D8%A8%D8%AF_%D8%A7%D9%84%D8%B5%D9%85%D8%AF_%D8%B1%D8%AD%D9%85%D9%87_%D8%A7%D9%84%D9%84%D9%87.jpg', provider: 'islamic', code: 'ar.abdulbasit' },
  { key: 'hussary', name: 'Mahmoud Khalil Al-Hussary', img: 'https://www.assabile.com/media/person/200x256/mahmoud-khalil-al-hussary.png', provider: 'everyayah', code: 'Hussary_128kbps' },
  { key: 'mustafa-ismail', name: 'Mustafa Ismail', img: 'https://everyayah.com/data/status/128/mustafa_ismail.jpg', provider: 'everyayah', code: 'MustafaIsmail_128kbps' },
  { key: 'alafasy', name: 'Mishary Rashid Alafasy', img: 'https://artwork.qurancentral.com/mishary-rashid-alafasy.jpg', provider: 'islamic', code: 'ar.alafasy' },
  { key: 'sudais', name: 'Abdul Rahman Al-Sudais', img: 'https://quranicaudio.com/images/7.jpg', provider: 'islamic', code: 'ar.sudais' },
  { key: 'shuraim', name: 'Saud Al-Shuraim', img: 'https://quranicaudio.com/images/4.jpg', provider: 'islamic', code: 'ar.shuraim' },
  { key: 'abdullah-awad', name: 'Abdullah Awad Al-Juhany', img: 'https://quranicaudio.com/images/10.jpg', provider: 'islamic', code: 'ar.juhany' },
  { key: 'ayyub', name: 'Muhammad Ayyub', img: 'https://everyayah.com/data/status/128/ayyub.jpg', provider: 'everyayah', code: 'Ayyub_128kbps' },
  { key: 'hudhaify-ali', name: 'Ali Al-Hudhaify', img: 'https://quranicaudio.com/images/11.jpg', provider: 'islamic', code: 'ar.hudhaifi' },
  { key: 'ajamy', name: 'Ahmed Al-Ajamy', img: 'https://everyayah.com/data/status/128/ajamy.jpg', provider: 'everyayah', code: 'Ajamy_128kbps' },
  { key: 'ghamdi', name: 'Saad Al-Ghamdi', img: 'https://quranicaudio.com/images/8.jpg', provider: 'islamic', code: 'ar.ghamdi' },
  { key: 'dosari', name: 'Yasser Al-Dosari', img: 'https://quranicaudio.com/images/12.jpg', provider: 'islamic', code: 'ar.yasser' },
  { key: 'maher', name: 'Maher Al-Muaiqly', img: 'https://quranicaudio.com/images/9.jpg', provider: 'islamic', code: 'ar.maher' },
  { key: 'muhammad-rifat', name: 'Muhammad Rifat', img: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Mohamed_Rifat.png', provider: 'match-islamic', match: 'rifat' },
  { key: 'mohamed-salamah', name: 'Mohamed Salamah', img: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Mohamed_Salamah.jpg', provider: 'match-islamic', match: 'salamah' },
  { key: 'basfar', name: 'Abdullah Basfar', img: 'https://everyayah.com/data/status/128/basfar.jpg', provider: 'everyayah', code: 'Basfar_192kbps' },
  { key: 'bahtimi', name: 'Kamil Yusuf Al-Bahtimi', img: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Kamel_Youssef_El-Bahtimi.jpg', provider: 'match-islamic', match: 'bahtimi' },
  { key: 'abdulrahman-huthaify', name: 'Abdul Rahman Al-Huthaify', img: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Abdul_Rahman_Al-Huthaify.jpg', provider: 'match-islamic', match: 'huthaify' },
  { key: 'budair', name: 'Salah Al-Budair', img: 'https://quranicaudio.com/images/14.jpg', provider: 'islamic', code: 'ar.budair' },
];

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
  const { audioRef, load, play, pause, playing, src, speed, setSpeed } = useAudio();
  const [reciter, setReciter] = useState(RECITERS.find(r => r.key === 'alafasy'));
  const [autoScroll, setAutoScroll] = useState(true);
  const [continuous, setContinuous] = useState(true);
  const [repeatMode, setRepeatMode] = useState("off"); // off | one | ab | all
  const [aPoint, setAPoint] = useState(null); // ayah numberInSurah
  const [bPoint, setBPoint] = useState(null);
  const preloadedRef = useRef(null); // next audio element for preload
  const [lastGlobalAyah, setLastGlobalAyah] = useState(null);

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

  const buildAudioUrl = (ayahNumberGlobal) => {
    if (!reciter) return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNumberGlobal}.mp3`;
    if (reciter.provider === 'islamic') {
      return `https://cdn.islamic.network/quran/audio/128/${reciter.code}/${ayahNumberGlobal}.mp3`;
    }
    if (reciter.provider === 'everyayah') {
      // needs 3-digit surah and ayah; we have global ayah number only here, but for per-ayah mapping we rely on arabic/english arrays
      // We can compute 3-digit tokens using current surah context
      const surahNum = english?.number || Number(number);
      const surahStr = String(surahNum).padStart(3, '0');
      // Find ayah within surah by global number
      const item = english?.ayahs?.find(a => a.number === ayahNumberGlobal);
      const ayahStr = String(item ? item.numberInSurah : 1).padStart(3, '0');
      return `https://everyayah.com/data/${reciter.code}/${surahStr}${ayahStr}.mp3`;
    }
    if (reciter.provider === 'match-islamic') {
      // map to closest known code from islamic.network by matching keyword
      const hint = reciter.match || 'alafasy';
      return `https://cdn.islamic.network/quran/audio/128/ar.${hint}/${ayahNumberGlobal}.mp3`;
    }
    return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNumberGlobal}.mp3`;
  };

  const preloadNext = (currNumberInSurah) => {
    if (!english?.ayahs) return;
    const idx = english.ayahs.findIndex(a => a.numberInSurah === currNumberInSurah);
    const next = english.ayahs[idx + 1];
    if (!next) { preloadedRef.current = null; return; }
    const url = buildAudioUrl(next.number);
    const el = new Audio();
    el.preload = 'auto';
    el.src = url;
    preloadedRef.current = el;
  };

  const onPlayAyah = (ayah) => {
    // Always build URL with current reciter selection
    const audioUrl = buildAudioUrl(ayah.number);
    load(audioUrl);
    play();
    setCurrentAyah(ayah.numberInSurah);
    setLastGlobalAyah(ayah.number);
    preloadNext(ayah.numberInSurah);
  };

  // auto-scroll to the active ayah while playing
  useEffect(() => {
    if (!autoScroll || currentAyah == null) return;
    const el = document.querySelector(`[data-testid="ayah-${currentAyah}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentAyah, autoScroll]);

  // handle end: repeat modes + continuous + use preloaded buffer when available
  useEffect(() => {
    if (!audioRef.current) return;
    const handler = () => {
      if (!english?.ayahs?.length) return;
      const idx = english.ayahs.findIndex(a => a.numberInSurah === currentAyah);
      const currAyah = english.ayahs[idx];

      // Repeat one
      if (repeatMode === 'one') {
        onPlayAyah(currAyah);
        return;
      }

      // Repeat A-B range
      if (repeatMode === 'ab' && aPoint && bPoint) {
        const nextNum = currentAyah >= bPoint ? aPoint : currentAyah + 1;
        const next = english.ayahs.find(a => a.numberInSurah === nextNum);
        if (next) { onPlayAyah(next); }
        return;
      }

      // Continuous / repeat all
      const next = english.ayahs[idx + 1];
      if (next) {
        // if we preloaded, swap its buffer in for instant start
        if (preloadedRef.current && preloadedRef.current.src.endsWith(`/${next.number}.mp3`)) {
          audioRef.current.src = preloadedRef.current.src;
          audioRef.current.playbackRate = speed;
          audioRef.current.play();
          setCurrentAyah(next.numberInSurah);
          preloadNext(next.numberInSurah);
        } else if (continuous) {
          onPlayAyah(next);
        }
      } else if (repeatMode === 'all') {
        const first = english.ayahs[0];
        onPlayAyah(first);
      }
    };

    audioRef.current.addEventListener('ended', handler);
    return () => { if (audioRef.current) audioRef.current.removeEventListener('ended', handler); };
  }, [audioRef, currentAyah, english, repeatMode, aPoint, bPoint, continuous, speed]);

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

  // force re-render to update progress bar periodically while playing
  const [, setTick] = useState(0);
  useEffect(() => {
    let id;
    if (playing) {
      id = setInterval(() => setTick((t) => t + 1), 500);
    }
    return () => { if (id) clearInterval(id); };
  }, [playing]);

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

          <div className="n-inset search" style={{ borderRadius: 18, marginBottom: 12, justifyContent: 'space-between' }}>
            <div className="subtitle">Reciter</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {reciter ? (
                <Avatar className="n-inset" style={{ borderRadius: '50%' }}>
                  <AvatarImage src={reciter.img} alt={reciter.name} />
                  <AvatarFallback>{reciter.name?.slice(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
              ) : null}
              <Select value={reciter?.key} onValueChange={(key) => setReciter(RECITERS.find(r => r.key === key))}>
                <SelectTrigger data-testid="reciter-select-top" className="n-inset" style={{ borderRadius: 12, minWidth: 240 }}>
                  <SelectValue>{reciter?.name}</SelectValue>
                </SelectTrigger>
                <SelectContent className="n-card">
                  {RECITERS.map(r => (
                    <SelectItem key={r.key} value={r.key} data-testid={`reciter-top-${r.key}`}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="n-btn" data-testid="jump-to-current" onClick={() => {
                if (currentAyah == null) return;
                const el = document.querySelector(`[data-testid="ayah-${currentAyah}"]`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}>Jump to Current</button>
            </div>
            {english.ayahs.map((enAyah, i) => {
              const isMatch = matches.includes(enAyah.numberInSurah);
              if (query && !isMatch) return null;
              const arAyah = arabic.ayahs[i];
              const active = currentAyah === enAyah.numberInSurah;
              const refProp = (query && isMatch && !firstMatchRef.current) ? { ref: firstMatchRef } : {};
              return (
                <div key={enAyah.number} {...refProp} className={`n-inset ayah ${active ? 'ayah-active' : ''}`} data-testid={`ayah-${enAyah.numberInSurah}`}>
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
        <div className="n-card player" data-testid="mini-player" style={{ gap: 16 }}>
          <button className="n-btn icon-btn" onClick={toggle} data-testid="mini-player-toggle">
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <div className="subtitle" style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 220 }}>
            {reciter ? (<Avatar className="n-inset" style={{ borderRadius: '50%' }}>
              <AvatarImage src={reciter.img} alt={reciter.name} />
              <AvatarFallback>{reciter.name?.slice(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>) : null}
            <span>{playing ? 'Playing' : 'Paused'} · {reciter?.name || 'Mishary Al‑Afasy'}</span>
          </div>
          <div style={{ width: 200 }}>
            <div className="subtitle" style={{ marginBottom: 6 }}>Reciter</div>
            <Select value={reciter?.key} onValueChange={(key) => setReciter(RECITERS.find(r => r.key === key))}>
              <SelectTrigger data-testid="reciter-select" className="n-inset" style={{ borderRadius: 12 }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="n-card">
                {RECITERS.map(r => (
                  <SelectItem key={r.key} value={r.key} data-testid={`reciter-${r.key}`}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="subtitle" style={{ marginTop: 8, marginBottom: 6 }}>Speed {speed.toFixed(1)}x</div>
            <Slider
              data-testid="speed-slider"
              min={0.5}
              max={2}
              step={0.1}
              value={[speed]}
              onValueChange={(v) => setSpeed(v[0])}
            />
            <div style={{ marginTop: 8 }}>
              <Progress data-testid="playback-progress" value={audioRef.current ? (audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100 : 0} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label className="subtitle" htmlFor="auto-scroll-switch">Auto-scroll</label>
            <Switch id="auto-scroll-switch" checked={autoScroll} onCheckedChange={setAutoScroll} data-testid="auto-scroll-toggle" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label className="subtitle" htmlFor="continuous-switch">Continuous</label>
            <Switch id="continuous-switch" checked={continuous} onCheckedChange={setContinuous} data-testid="continuous-toggle" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 220 }}>
            <label className="subtitle">Repeat</label>
            <Select value={repeatMode} onValueChange={setRepeatMode}>
              <SelectTrigger data-testid="repeat-mode-select" className="n-inset" style={{ borderRadius: 12 }}>
                <SelectValue placeholder="Repeat" />
              </SelectTrigger>
              <SelectContent className="n-card">
                <SelectItem value="off" data-testid="repeat-off">Off</SelectItem>
                <SelectItem value="one" data-testid="repeat-one">Single Ayah</SelectItem>
                <SelectItem value="ab" data-testid="repeat-ab">A–B Range</SelectItem>
                <SelectItem value="all" data-testid="repeat-all">Whole Surah</SelectItem>
              </SelectContent>
            </Select>
            {repeatMode === 'ab' ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="n-btn" data-testid="set-a-btn" onClick={() => setAPoint(currentAyah)}>Set A</button>
                <button className="n-btn" data-testid="set-b-btn" onClick={() => setBPoint(currentAyah)}>Set B</button>
              </div>
            ) : null}
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