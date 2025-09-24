import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { Play, Pause } from 'lucide-react'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

const RECITERS = [
  { key: 'alafasy', name: 'Mishary Rashid Alafasy', img: 'https://artwork.qurancentral.com/mishary-rashid-alafasy.jpg' },
  { key: 'sudais', name: 'Abdul Rahman Al-Sudais', img: 'https://quranicaudio.com/images/7.jpg' },
  { key: 'shuraim', name: 'Saud Al-Shuraim', img: 'https://quranicaudio.com/images/4.jpg' },
  { key: 'minshawi', name: 'Muhammad Siddiq Al-Minshawi', img: 'https://everyayah.com/data/status/128/minshawi.jpg' },
  { key: 'ajamy', name: 'Ahmed Al-Ajamy', img: 'https://everyayah.com/data/status/128/ajamy.jpg' },
]

function useApi() {
  const api = useMemo(() => axios.create({ baseURL: API }), [])
  return api
}

function useAudio() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [src, setSrc] = useState('')
  const [speed, setSpeed] = useState(() => parseFloat(localStorage.getItem('quran.speed') || '1'))

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'auto'
    }
  }, [])

  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = speed }, [speed])

  const load = (url) => {
    if (!audioRef.current) audioRef.current = new Audio()
    if (src !== url) { setSrc(url); audioRef.current.src = url; audioRef.current.playbackRate = speed }
  }
  const play = async () => { try { await audioRef.current.play(); setPlaying(true) } catch(e){} }
  const pause = () => { audioRef.current.pause(); setPlaying(false) }
  return { audioRef, load, play, pause, playing, src, speed, setSpeed }
}

export default function SurahPage() {
  const api = useApi()
  const urlParams = new URLSearchParams(window.location.search)
  const number = window.location.pathname.split('/').pop()

  const [arabic, setArabic] = useState(null)
  const [english, setEnglish] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentAyah, setCurrentAyah] = useState(null)
  const [reciter, setReciter] = useState(() => {
    const saved = localStorage.getItem('quran.reciter');
    return saved ? JSON.parse(saved) : RECITERS[0];
  })
  const [bitrate, setBitrate] = useState(() => localStorage.getItem('quran.bitrate') || '128')
  const { audioRef, load, play, pause, playing, src, speed, setSpeed } = useAudio()

  useEffect(() => { localStorage.setItem('quran.reciter', JSON.stringify(reciter)) }, [reciter])
  useEffect(() => { localStorage.setItem('quran.bitrate', bitrate) }, [bitrate])
  useEffect(() => { localStorage.setItem('quran.speed', String(speed)) }, [speed])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const [{ data: en }, { data: ar }] = await Promise.all([
          api.get(`/quran/surah/${number}?edition=en.asad`),
          api.get(`/quran/surah/${number}/arabic?edition=quran-uthmani`),
        ])
        if (!mounted) return
        setEnglish(en?.data)
        setArabic(ar?.data)
      } catch (e) { console.error(e) } finally { if (mounted) setLoading(false) }
    })()
    return () => { mounted = false }
  }, [api, number])

  const buildAudioUrl = async (ayahNumberGlobal, ayahInSurah) => {
    try {
      const { data } = await axios.post(`${API}/audio/resolve`, {
        reciter_key: reciter.key,
        bitrate,
        surah: Number(number),
        ayah_in_surah: ayahInSurah,
        global_ayah: ayahNumberGlobal,
      })
      return data?.url
    } catch { return null }
  }

  const onPlayAyah = async (ayah) => {
    const url = await buildAudioUrl(ayah.number, ayah.numberInSurah)
    if (url) {
      load(url)
      play()
      setCurrentAyah(ayah.numberInSurah)
    }
  }

  const [time, setTime] = useState({ cur: 0, dur: 0 })
  useEffect(() => {
    let id
    if (audioRef.current) {
      id = setInterval(() => {
        const a = audioRef.current
        if (a && a.duration) setTime({ cur: a.currentTime || 0, dur: a.duration || 0 })
      }, 500)
    }
    return () => { if (id) clearInterval(id) }
  }, [audioRef, playing])

  const fmt = (t) => {
    if (!t || !isFinite(t)) return '0:00'
    const m = Math.floor(t/60), s = Math.floor(t%60)
    return `${m}:${String(s).padStart(2,'0')}`
  }

  if (loading || !english || !arabic) {
    return <div className="container n-card" style={{ padding: 18 }} data-testid="surah-skeleton">Loading...</div>
  }

  return (
    <div className="container" data-testid="surah-page">
      <div className="n-card" style={{ padding: 18 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12 }}>
          <div>
            <div className="surah-title" data-testid="surah-name">{english.englishName} · {arabic.name}</div>
            <div className="subtitle" data-testid="surah-meta">{english.englishNameTranslation} · {english.revelationType} · {english.numberOfAyahs} ayat</div>
          </div>
          <a href="/app" className="n-btn" data-testid="back-to-list">Back</a>
        </div>

        <div className="n-inset search" style={{ borderRadius: 18, marginBottom: 12, justifyContent:'space-between' }}>
          <div className="subtitle">Reciter</div>
          <Select value={reciter.key} onValueChange={(k) => setReciter(RECITERS.find(r=>r.key===k))}>
            <SelectTrigger className="n-inset" data-testid="reciter-select-top" style={{ borderRadius: 12, minWidth: 220 }}>
              <SelectValue>{reciter.name}</SelectValue>
            </SelectTrigger>
            <SelectContent className="n-card">
              {RECITERS.map(r => <SelectItem key={r.key} value={r.key} data-testid={`reciter-top-${r.key}`}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="subtitle">Bitrate</div>
          <Select value={bitrate} onValueChange={setBitrate}>
            <SelectTrigger className="n-inset" data-testid="bitrate-select" style={{ borderRadius: 12, minWidth: 90 }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="n-card">
              <SelectItem value="64" data-testid="bitrate-64">64 kbps</SelectItem>
              <SelectItem value="128" data-testid="bitrate-128">128 kbps</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div style={{ display:'grid', gap: 10 }}>
          {english.ayahs.map((enAyah, i) => {
            const arAyah = arabic.ayahs[i]
            const active = currentAyah === enAyah.numberInSurah
            return (
              <div key={enAyah.number} className={`n-inset ayah ${active ? 'ayah-active' : ''}`} data-testid={`ayah-${enAyah.numberInSurah}`}>
                <div className="row">
                  <div>
                    <div className="arabic" dir="rtl">{arAyah.text}</div>
                    <div style={{ height: 8 }} />
                    <div>{enAyah.text}</div>
                    <div className="subtitle">Ayah {enAyah.numberInSurah}</div>
                  </div>
                  <div>
                    <button className="n-btn icon-btn" data-testid={`ayah-play-${enAyah.numberInSurah}`} onClick={() => onPlayAyah(enAyah)} aria-label="Play ayah">
                      <Play size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {src ? (
        <div className="n-card player" data-testid="mini-player" style={{ gap: 16 }}>
          <button className="n-btn icon-btn" onClick={() => (playing ? pause() : play())} data-testid="mini-player-toggle">
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <div className="subtitle" style={{ minWidth: 160 }}>{playing ? 'Playing' : 'Paused'} · {reciter.name}</div>
          <div style={{ width: 260 }}>
            <div className="subtitle" style={{ marginBottom: 6 }}>Speed {speed.toFixed(1)}x</div>
            <input data-testid="speed-range" type="range" min="0.5" max="2" step="0.1" value={speed} onChange={(e)=>setSpeed(parseFloat(e.target.value))} style={{ width: '100%' }} />
            <div style={{ display:'flex', justifyContent:'space-between', marginTop: 6 }}>
              <span className="subtitle">{fmt(time.cur)}</span>
              <span className="subtitle">{fmt(time.dur)}</span>
            </div>
            <div className="n-inset" style={{ height: 10, borderRadius: 8, position:'relative', marginTop: 6 }} onClick={(e)=>{
              if (!audioRef.current || !time.dur) return
              const rect = e.currentTarget.getBoundingClientRect();
              const p = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
              audioRef.current.currentTime = p * time.dur
            }}>
              <div style={{ position:'absolute', inset:0, borderRadius:8, background:'rgba(6,95,70,0.15)' }} />
              <div style={{ position:'absolute', left:0, top:0, bottom:0, width: `${(time.cur/(time.dur||1))*100}%`, background:'rgba(6,95,70,0.5)', borderRadius:8 }} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}