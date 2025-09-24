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
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "./components/ui/tooltip";
import { openAudioDB, putBlob, getBlob, countBlobs, iterateKeys, deleteBlob, clearPrefix } from "./utils/idb";

// Top 20 Reciters (name, avatar, provider, code or match hint)
const RECITERS = [
  { key: 'minshawi', name: 'Muhammad Siddiq Al-Minshawi', img: 'https://everyayah.com/data/status/128/minshawi.jpg', islamicCode: 'ar.minshawi', everyayahCode: 'Minshawi_Murattal_128kbps' },
  { key: 'abdul-basit', name: 'Abdul Basit Abdul Samad', img: 'https://upload.wikimedia.org/wikipedia/commons/7/75/%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%A8%D8%A7%D8%B3%D8%B7_%D8%B9%D8%A8%D8%AF_%D8%A7%D9%84%D8%B5%D9%85%D8%AF_%D8%B1%D8%AD%D9%85%D9%87_%D8%A7%D9%84%D9%84%D9%87.jpg', islamicCode: 'ar.abdulbasit' },
  { key: 'hussary', name: 'Mahmoud Khalil Al-Hussary', img: 'https://www.assabile.com/media/person/200x256/mahmoud-khalil-al-hussary.png', everyayahCode: 'Hussary_128kbps' },
  { key: 'mustafa-ismail', name: 'Mustafa Ismail', img: 'https://everyayah.com/data/status/128/mustafa_ismail.jpg', everyayahCode: 'MustafaIsmail_128kbps' },
  { key: 'alafasy', name: 'Mishary Rashid Alafasy', img: 'https://artwork.qurancentral.com/mishary-rashid-alafasy.jpg', islamicCode: 'ar.alafasy' },
  { key: 'sudais', name: 'Abdul Rahman Al-Sudais', img: 'https://quranicaudio.com/images/7.jpg', islamicCode: 'ar.sudais' },
  { key: 'shuraim', name: 'Saud Al-Shuraim', img: 'https://quranicaudio.com/images/4.jpg', islamicCode: 'ar.shuraim' },
  { key: 'abdullah-awad', name: 'Abdullah Awad Al-Juhany', img: 'https://quranicaudio.com/images/10.jpg', islamicCode: 'ar.juhany' },
  { key: 'ayyub', name: 'Muhammad Ayyub', img: 'https://everyayah.com/data/status/128/ayyub.jpg', everyayahCode: 'Ayyub_128kbps' },
  { key: 'hudhaify-ali', name: 'Ali Al-Hudhaify', img: 'https://quranicaudio.com/images/11.jpg', islamicCode: 'ar.hudhaifi' },
  { key: 'ajamy', name: 'Ahmed Al-Ajamy', img: 'https://everyayah.com/data/status/128/ajamy.jpg', everyayahCode: 'Ajamy_128kbps' },
  { key: 'ghamdi', name: 'Saad Al-Ghamdi', img: 'https://quranicaudio.com/images/8.jpg', islamicCode: 'ar.ghamdi' },
  { key: 'dosari', name: 'Yasser Al-Dosari', img: 'https://quranicaudio.com/images/12.jpg', islamicCode: 'ar.yasser' },
  { key: 'maher', name: 'Maher Al-Muaiqly', img: 'https://quranicaudio.com/images/9.jpg', islamicCode: 'ar.maher' },
  { key: 'muhammad-rifat', name: 'Muhammad Rifat', img: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Mohamed_Rifat.png', islamicCode: 'ar.rifat' },
  { key: 'mohamed-salamah', name: 'Mohamed Salamah', img: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Mohamed_Salamah.jpg', islamicCode: 'ar.salamah' },
  { key: 'basfar', name: 'Abdullah Basfar', img: 'https://everyayah.com/data/status/128/basfar.jpg', islamicCode: 'ar.basfar', everyayahCode: 'Basfar_192kbps' },
  { key: 'bahtimi', name: 'Kamil Yusuf Al-Bahtimi', img: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Kamel_Youssef_El-Bahtimi.jpg', islamicCode: 'ar.bahtimi' },
  { key: 'abdulrahman-huthaify', name: 'Abdul Rahman Al-Huthaify', img: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Abdul_Rahman_Al-Huthaify.jpg', islamicCode: 'ar.hudhaifi' },
  { key: 'budair', name: 'Salah Al-Budair', img: 'https://quranicaudio.com/images/14.jpg', islamicCode: 'ar.budair' },
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
  const [speed, setSpeed] = useState(() => parseFloat(localStorage.getItem('quran.speed') || '1'));

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
  const [db, setDb] = useState(null);
  useEffect(() => { (async () => setDb(await openAudioDB()))(); }, []);
  // preferences
  const [reciter, setReciter] = useState(() => {
    const saved = localStorage.getItem('quran.reciter');
    return saved ? JSON.parse(saved) : RECITERS.find(r => r.key === 'alafasy');
  });
  const [bitrate, setBitrate] = useState(() => localStorage.getItem('quran.bitrate') || '128'); // '64' or '128'
  const [autoScroll, setAutoScroll] = useState(() => (localStorage.getItem('quran.autoScroll') ?? 'true') === 'true');
  const [continuous, setContinuous] = useState(() => (localStorage.getItem('quran.continuous') ?? 'true') === 'true');
  const [repeatMode, setRepeatMode] = useState(() => localStorage.getItem('quran.repeatMode') || "off"); // off | one | ab | all
  const [aPoint, setAPoint] = useState(null); // ayah numberInSurah
  const [bPoint, setBPoint] = useState(null);
  const preloadedRef = useRef(null); // next audio element for preload
  const [lastGlobalAyah, setLastGlobalAyah] = useState(null);
  const [audioEditions, setAudioEditions] = useState([]);
  const [editionMap, setEditionMap] = useState({});

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const [{ data: en }, { data: ar }, { data: editions }] = await Promise.all([
          api.get(`/quran/surah/${number}?edition=en.asad`),
          api.get(`/quran/surah/${number}/arabic?edition=quran-uthmani`),
          api.get(`/quran/editions`),
        ]);
        if (!mounted) return;
        setEnglish(en?.data);
        setArabic(ar?.data);
        const audios = (editions?.data || editions)?.data || editions;
        const onlyAudio = Array.isArray(audios) ? audios.filter(e => e.format === 'audio') : [];
        setAudioEditions(onlyAudio);
        // Build name/code map to islamic.network codes when available
        const map = {};
        onlyAudio.forEach(e => {
          // e.identifier like ar.alafasy
          map[(e.englishName || '').toLowerCase()] = e.identifier;
          map[(e.name || '').toLowerCase()] = e.identifier;
          map[(e.identifier || '').toLowerCase()] = e.identifier;
        });
        setEditionMap(map);
      } catch (e) {
        console.error("Failed to load surah", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [api, number]);

  // persist preferences when changed
  useEffect(() => { localStorage.setItem('quran.reciter', JSON.stringify(reciter)); }, [reciter]);
  useEffect(() => { localStorage.setItem('quran.speed', String(speed)); }, [speed]);
  useEffect(() => { localStorage.setItem('quran.repeatMode', repeatMode); }, [repeatMode]);
  useEffect(() => { localStorage.setItem('quran.autoScroll', String(autoScroll)); }, [autoScroll]);
  useEffect(() => { localStorage.setItem('quran.continuous', String(continuous)); }, [continuous]);
  useEffect(() => { localStorage.setItem('quran.bitrate', bitrate); }, [bitrate]);

  const normalize = (s) => (s || '').toLowerCase().replace(/[-_.]/g, ' ').replace(/\s+/g, ' ').trim();

  const resolveIslamicCode = (rec) => {
    if (!rec) return 'ar.alafasy';
    // 1) direct code from reciter record
    if (rec.islamicCode) return rec.islamicCode;
    // 2) dynamic map from /quran/editions by name or known hints
    const keys = [rec.name, rec.key, rec.match].filter(Boolean).map(normalize);
    for (const k of keys) {
      // try name match first
      for (const edName in editionMap) {
        if (normalize(edName).includes(k)) return editionMap[edName];
      }
    }
    // 3) fallback guessed ar.<match>
    if (rec.match) return `ar.${rec.match}`;
    return 'ar.alafasy';
  };

  // Ask backend to resolve best URL across providers to ensure playback for all reciters
  const buildAudioUrl = (ayahNumberGlobal, ayahInSurahOverride) => {
    const surahNum = english?.number || Number(number);
    const ayahInSurah = ayahInSurahOverride ?? (english?.ayahs?.find(a => a.number === ayahNumberGlobal)?.numberInSurah || 1);
    return axios.post(`${API}/audio/resolve`, {
      reciter_key: reciter?.key,
      bitrate,
      surah: surahNum,
      ayah_in_surah: ayahInSurah,
      global_ayah: ayahNumberGlobal,
    }).then(r => r.data?.url).catch(() => null);
  };

  const preloadNext = async (currNumberInSurah) => {
    if (!english?.ayahs) return;
    const idx = english.ayahs.findIndex(a => a.numberInSurah === currNumberInSurah);
    const next = english.ayahs[idx + 1];
    if (!next) { preloadedRef.current = null; return; }
    const url = await buildAudioUrl(next.number);
    if (url) {
      const el = new Audio();
      el.preload = 'auto';
      el.src = url;
      preloadedRef.current = el;
    }
  };

  const onPlayAyah = async (ayah) => {
    // Always build URL with current reciter selection
    const audioUrl = await buildAudioUrl(ayah.number);
    if (audioUrl) {
      load(audioUrl);
      play();
      setCurrentAyah(ayah.numberInSurah);
      setLastGlobalAyah(ayah.number);
      preloadNext(ayah.numberInSurah);
    }
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
  const [time, setTime] = useState({ cur: 0, dur: 0 });
  const [seekPreview, setSeekPreview] = useState(null);
  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const seekWrapRef = useRef(null);
  function fmt(t) {
    if (!t || !isFinite(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
  useEffect(() => {
    let id;
    if (audioRef.current) {
      id = setInterval(() => {
        const a = audioRef.current;
        if (a && a.duration) setTime({ cur: a.currentTime || 0, dur: a.duration || 0 });
        setTick((t) => t + 1);
      }, 500);
    }
    return () => { if (id) clearInterval(id); };
  }, [playing, audioRef]);

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      {reciter ? (
                        <Avatar className="n-inset" style={{ borderRadius: '50%' }}>
                          <AvatarImage src={reciter.img} alt={reciter.name} />
                          <AvatarFallback>{reciter.name?.slice(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      ) : null}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{reciter?.name}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

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

              <div className="badge-soft" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="subtitle">Bitrate</span>
                <Select value={bitrate} onValueChange={setBitrate}>
                  <SelectTrigger data-testid="bitrate-select" className="n-inset" style={{ borderRadius: 12, minWidth: 90 }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="n-card">
                    <SelectItem value="64" data-testid="bitrate-64">64 kbps</SelectItem>
                    <SelectItem value="128" data-testid="bitrate-128">128 kbps</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
              <button className="n-btn" data-testid="jump-to-current" onClick={() => {
                if (currentAyah == null) return;
                const el = document.querySelector(`[data-testid="ayah-${currentAyah}"]`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}>Jump to Current</button>
              <div className="queue">
                <button className="n-btn" data-testid="download-surah" onClick={async () => {
                  if (!db) return;
                  const full = confirm('Download full surah? (Cancel = first 50 ayahs)');
                  const jobs = full ? english.ayahs : english.ayahs.slice(0, 50);
                  let paused = false, canceled = false;
                  window.qDownloadCtrl = {
                    pause: () => { paused = true; },
                    resume: () => { paused = false; },
                    cancel: () => { canceled = true; },
                  };
                  const total = jobs.length;
                  let done = 0;
                  for (const a of jobs) {
                    if (canceled) break;
                    while (paused) { await new Promise(r => setTimeout(r, 200)); }
                    const url = await buildAudioUrl(a.number, a.numberInSurah);
                    if (!url) { done++; continue; }
                    try {
                      const res = await fetch(url);
                      const blob = await res.blob();
                      const key = `${reciter?.key||'alafasy'}:${bitrate}:${english.number}:${a.numberInSurah}`;
                      await putBlob(db, key, blob);
                    } catch (e) { console.warn('cache failed', e); }
                    done++;
                    const bar = document.querySelector('[data-testid="queue-progress"]');
                    if (bar) bar.style.width = `${Math.round((done/total)*100)}%`;
                    const label = document.querySelector('[data-testid="queue-label"]');
                    if (label) label.textContent = `${done}/${total}`;
                  }
                  alert(canceled ? 'Download canceled.' : 'Download complete.');
                }}>Download Surah for Offline</button>
                <div className="n-inset" style={{ padding: 6, borderRadius: 12 }}>
                  <div className="subtitle" style={{ marginBottom: 4 }}>Queue</div>
                  <div style={{ position: 'relative', width: 180, height: 8, background: 'rgba(6,95,70,0.15)', borderRadius: 8 }}>
                    <div data-testid="queue-progress" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '0%', background: 'rgba(6,95,70,0.6)', borderRadius: 8 }} />
                  </div>
                  <div className="subtitle" data-testid="queue-label">0/0</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <button className="n-btn" onClick={() => window.qDownloadCtrl?.pause()} data-testid="queue-pause">Pause</button>
                    <button className="n-btn" onClick={() => window.qDownloadCtrl?.resume()} data-testid="queue-resume">Resume</button>
                    <button className="n-btn" onClick={() => window.qDownloadCtrl?.cancel()} data-testid="queue-cancel">Cancel</button>
                  </div>
                </div>
                <button className="n-btn" data-testid="storage-count" onClick={async () => {
                  if (!db) return;
                  const prefix = `${reciter?.key||'alafasy'}:${bitrate}:${english.number}:`;
                  const c = await countBlobs(db, prefix);
                  alert(`Cached clips for this surah: ${c}`);
                }}>Cache Info</button>
              </div>
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
          <div style={{ width: 260 }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span className="subtitle">{fmt(time.cur)}</span>
              <span className="subtitle">{fmt(time.dur)}</span>
            </div>
            {/* Seekable progress via click/drag on a simple bar */}
            <div
              ref={seekWrapRef}
              role="slider"
              aria-valuemin={0}
              aria-valuemax={time.dur || 0}
              aria-valuenow={time.cur || 0}
              aria-label="Seek"
              tabIndex={0}
              onKeyDown={(e) => {
                if (!audioRef.current || !time.dur) return;
                const step = e.shiftKey ? 10 : 5;
                if (e.key === 'ArrowRight') { audioRef.current.currentTime = Math.min(time.dur, (audioRef.current.currentTime || 0) + step); }
                if (e.key === 'ArrowLeft') { audioRef.current.currentTime = Math.max(0, (audioRef.current.currentTime || 0) - step); }
              }}
              data-testid="seek-bar"
              className="n-inset"
              style={{ height: 12, borderRadius: 8, position: 'relative', cursor: 'pointer', padding: 0, marginTop: 6 }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const p = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
                const preview = (time.dur || 0) * p;
                setSeekPreview({ x: e.clientX - rect.left, label: fmt(preview) });
                if (seeking) setSeekValue(p);
              }}
              onMouseLeave={() => { setSeekPreview(null); setSeeking(false); }}
              onMouseDown={(e) => {
                if (!audioRef.current || !time.dur) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const p = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
                setSeeking(true); setSeekValue(p);
                audioRef.current.currentTime = p * time.dur;
              }}
            >
              <div style={{ position: 'absolute', inset: 0, borderRadius: 8, background: 'rgba(6,95,70,0.15)' }} />
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${((seeking?seekValue:time.cur)/(time.dur||1))*100}%`, background: 'rgba(6,95,70,0.5)', borderRadius: 8 }} />
              {seekPreview ? (
                <div style={{ position: 'absolute', left: Math.max(0, Math.min(seekPreview.x - 18, 240)), top: -26 }} className="badge-soft">{seekPreview.label}</div>
              ) : null}
              {/* Scrub handle */}
              <div style={{ position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)', left: `${((seeking?seekValue:time.cur)/(time.dur||1))*100}%`, width: 14, height: 14, borderRadius: 10, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }} />
            </div>
            {/* Complete dragging on mouse up globally */}
            <div onMouseUp={() => setSeeking(false)} />
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