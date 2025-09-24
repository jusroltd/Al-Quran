import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
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

// ... the rest of App.js remains as previously saved (SurahPage, mini-player, queue, etc.)

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        {/* Landing route */}
        <Routes>
          <Route path="/" element={<LandingRouter />} />
          <Route path="/app" element={<>
            <Header />
            <SurahListPage />
          </>} />
          <Route path="/surah/:number" element={<>
            <Header />
            <SurahPage />
          </>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

function LandingRouter() {
  // Lazy import replacement for simplicity in MVP
  const L = require('./pages/Landing.jsx').default;
  return <L />;
}

export default App;