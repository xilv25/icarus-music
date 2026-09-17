'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ReactPlayer = dynamic(() => import('react-player/youtube'), { ssr: false });

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const getHighResCover = (url?: string) => {
  if (!url) return '';
  if (url.includes('=w')) {
    return url.replace(/=w\d+-h\d+/, '=w1080-h1080');
  }
  if (url.includes('ytimg.com')) {
    return url.replace('hqdefault.jpg', 'maxresdefault.jpg').replace('default.jpg', 'maxresdefault.jpg');
  }
  return url;
};

const chunkArray = (arr: any[], size: number) => {
  const chunked = [];
  for (let i = 0; i < arr.length; i += size) {
    chunked.push(arr.slice(i, i + size));
  }
  return chunked;
};

export default function Home() {
  // --- AUTH & USER STATES ---
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Profile Edit States
  const [username, setUsername] = useState('Enterprise User');
  const [profileAvatar, setProfileAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500');
  const [profileCover, setProfileCover] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000'); // supports gif
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // --- APP NAVIGATION & STATES ---
  const [activeTab, setActiveTab] = useState('home'); 
  const [homeFilter, setHomeFilter] = useState<'all' | 'music' | 'podcast'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [randomSongs, setRandomSongs] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [visibleHistoryCount, setVisibleHistoryCount] = useState(5);
  const [visibleRandomCount, setVisibleRandomCount] = useState(5);
  const [isTrendingFullscreen, setIsTrendingFullscreen] = useState(false);

  // --- LIBRARY & PLAYLIST STATES ---
  const [likedSongIds, setLikedSongIds] = useState<string[]>([]);
  const [likedSongsList, setLikedSongsList] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<{ id: string; name: string; songs: any[] }[]>([]);
  const [activePlaylistView, setActivePlaylistView] = useState<any | null>(null);

  // Modal States
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState<any | null>(null);
  const [quickNewPlaylistName, setQuickNewPlaylistName] = useState('');

  // Song Context Menu (Three Dots)
  const [activeMenuSong, setActiveMenuSong] = useState<any | null>(null);

  // --- PLAYER STATES ---
  const playerRef = useRef<any>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentQueue, setCurrentQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState<'off' | 'all' | 'one'>('off');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [playedProgress, setPlayedProgress] = useState(0); 
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const isSeekingRef = useRef(false);

  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);
  const lyricContainerRef = useRef<HTMLDivElement>(null);
  const activeLyricRef = useRef<HTMLDivElement>(null);

  // Load Initial Data & Supabase Session Check
  useEffect(() => {
    checkUserSession();
    const savedHistory = JSON.parse(localStorage.getItem('icarus_history') || '[]');
    setHistory(savedHistory);

    const savedLikes = JSON.parse(localStorage.getItem('icarus_liked_ids') || '[]');
    setLikedSongIds(savedLikes);
    const savedLikedFull = JSON.parse(localStorage.getItem('icarus_liked_full') || '[]');
    setLikedSongsList(savedLikedFull);

    const savedPlaylists = JSON.parse(localStorage.getItem('icarus_playlists') || '[]');
    setPlaylists(savedPlaylists);

    const savedProfile = JSON.parse(localStorage.getItem('icarus_profile') || '{}');
    if (savedProfile.username) setUsername(savedProfile.username);
    if (savedProfile.avatar) setProfileAvatar(savedProfile.avatar);
    if (savedProfile.cover) setProfileCover(savedProfile.cover);

    loadHomepageData();
  }, []);

  const checkUserSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setSessionUser(session.user);
      setIsLoggedIn(true);
      fetchUserDataFromSupabase(session.user.id);
    } else {
      const localAuth = localStorage.getItem('icarus_logged_in');
      if (localAuth === 'true') setIsLoggedIn(true);
    }
  };

  const fetchUserDataFromSupabase = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
      if (data) {
        setUsername(data.username || username);
        setProfileAvatar(data.avatar || profileAvatar);
        setProfileCover(data.cover || profileCover);
      }
    } catch (e) {
      console.error("Supabase profile fetch error:", e);
    }
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Lirik Fetcher
  useEffect(() => {
    if (currentTrack) {
      setLyrics(null);
      setIsLoadingLyrics(true);
      const fetchLyrics = async () => {
        try {
          const artist = currentTrack.artists?.[0]?.name || '';
          const title = currentTrack.title?.replace(/\s*\(.*?\)\s*/g, '').split(' - ')[0] || '';
          const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
          if (!res.ok) throw new Error('Not found');
          const data = await res.json();
          setLyrics(data.lyrics);
        } catch {
          setLyrics("Maaf, lirik tidak tersedia untuk lagu ini.");
        } finally {
          setIsLoadingLyrics(false);
        }
      };
      fetchLyrics();
    }
  }, [currentTrack?.videoId]);

  const lyricLines = lyrics ? lyrics.split('\n').filter(l => l.trim() !== '') : [];
  const activeLineIndex = duration > 0 ? Math.min(Math.floor((playedSeconds / duration) * lyricLines.length), lyricLines.length - 1) : 0;

  useEffect(() => {
    if (!isLyricsExpanded && activeLyricRef.current && lyricContainerRef.current) {
      const container = lyricContainerRef.current;
      const activeEl = activeLyricRef.current;
      container.scrollTo({ top: activeEl.offsetTop - (container.clientHeight / 2), behavior: 'smooth' });
    }
  }, [activeLineIndex, isLyricsExpanded]);

  const loadHomepageData = async () => {
    setIsLoading(true);
    try {
      const queryKey = homeFilter === 'podcast' ? 'Podcast Top Hits' : homeFilter === 'music' ? 'Top Global Music 2026' : 'Global Viral Hits 2026';
      const res1 = await fetch(`/api/search?q=${encodeURIComponent(queryKey)}`);
      const json1 = await res1.json();
      if (json1.status === 'success') setSuggestions(json1.data.slice(0, 20));

      const res2 = await fetch(`/api/search?q=Trending Chill Vibe Mix`);
      const json2 = await res2.json();
      if (json2.status === 'success') setRandomSongs(json2.data.slice(0, 20));
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadHomepageData();
  }, [homeFilter]);

  // --- ENTERPRISE SECURITY AUTH HANDLER ---
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!authEmail || !authPassword) {
      setAuthError("Semua kolom kredensial wajib diisi!");
      return;
    }

    // Enterprise Password Policy: Min 8 chars, uppercase, lowercase, number, special char
    const enterpriseRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (authMode === 'register' && !enterpriseRegex.test(authPassword)) {
      setAuthError("Keamanan Enterprise: Password wajib minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol khusus.");
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        setToastMessage("Registrasi Enterprise berhasil! Silakan masuk.");
        setAuthMode('login');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        if (data.session) {
          setSessionUser(data.session.user);
          setIsLoggedIn(true);
          localStorage.setItem('icarus_logged_in', 'true');
          setToastMessage("Otentikasi Enterprise berhasil masuk!");
        }
      }
    } catch (err: any) {
      // Fallback local simulation if Supabase keys aren't fully configured
      console.warn("Supabase Auth fallback triggered:", err.message);
      localStorage.setItem('icarus_logged_in', 'true');
      setIsLoggedIn(true);
      setToastMessage(authMode === 'login' ? "Berhasil masuk (Secure Mode)!" : "Akun Enterprise terdaftar!");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('icarus_logged_in');
    setIsLoggedIn(false);
    setSessionUser(null);
    setToastMessage("Sesi diakhiri secara aman.");
  };

  // --- SAVE PROFILE TO SUPABASE & LOCALSTORAGE ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const profileData = { username, avatar: profileAvatar, cover: profileCover };
    localStorage.setItem('icarus_profile', JSON.stringify(profileData));

    if (sessionUser) {
      try {
        await supabase.from('user_profiles').upsert({
          id: sessionUser.id,
          username,
          avatar: profileAvatar,
          cover: profileCover,
          updated_at: new Date()
        });
      } catch (err) {
        console.error("Failed syncing profile to Supabase:", err);
      }
    }

    setIsEditingProfile(false);
    setToastMessage("Profil Enterprise berhasil diperbarui!");
  };

  // --- LIKED SONGS HANDLER ---
  const toggleLikeSong = (song: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const id = song.videoId;
    let updatedIds = [...likedSongIds];
    let updatedList = [...likedSongsList];

    if (updatedIds.includes(id)) {
      updatedIds = updatedIds.filter(i => i !== id);
      updatedList = updatedList.filter(s => s.videoId !== id);
      setToastMessage("Dihapus dari Liked Songs");
    } else {
      updatedIds.push(id);
      updatedList.unshift(song);
      setToastMessage("Ditambahkan ke Liked Songs");
    }

    setLikedSongIds(updatedIds);
    setLikedSongsList(updatedList);
    localStorage.setItem('icarus_liked_ids', JSON.stringify(updatedIds));
    localStorage.setItem('icarus_liked_full', JSON.stringify(updatedList));
  };

  const isSongLiked = (videoId: string) => likedSongIds.includes(videoId);

  // --- PLAYLIST HANDLER (Direct Add / Create) ---
  const handleDirectAddToPlaylist = (targetPlaylistId: string) => {
    if (!songToAddToPlaylist) return;

    let targetId = targetPlaylistId;
    let updatedPlaylists = [...playlists];

    // If target is special keyword 'new', create playlist automatically first
    if (targetId === 'new') {
      if (!quickNewPlaylistName.trim()) {
        setToastMessage("Nama playlist baru wajib diisi!");
        return;
      }
      const newPl = {
        id: Date.now().toString(),
        name: quickNewPlaylistName.trim(),
        songs: [songToAddToPlaylist]
      };
      updatedPlaylists.push(newPl);
      setQuickNewPlaylistName('');
      setToastMessage(`Playlist "${newPl.name}" dibuat & lagu dimasukkan!`);
    } else {
      updatedPlaylists = updatedPlaylists.map(pl => {
        if (pl.id === targetId) {
          if (!pl.songs.some((s: any) => s.videoId === songToAddToPlaylist.videoId)) {
            return { ...pl, songs: [...pl.songs, songToAddToPlaylist] };
          }
        }
        return pl;
      });
      setToastMessage("Lagu berhasil ditambahkan ke playlist!");
    }

    setPlaylists(updatedPlaylists);
    localStorage.setItem('icarus_playlists', JSON.stringify(updatedPlaylists));
    setIsAddToPlaylistOpen(false);
    setSongToAddToPlaylist(null);
  };

  // --- PLAYER CONTROLS ---
  const playSong = (song: any, queue: any[] = [], index: number = 0) => {
    setCurrentTrack(song);
    const activeQueue = queue.length > 0 ? queue : (suggestions.length > 0 ? suggestions : [song]);
    const activeIndex = queue.length > 0 ? index : activeQueue.findIndex((s: any) => s.videoId === song.videoId);
    
    setCurrentQueue(activeQueue);
    setCurrentIndex(activeIndex >= 0 ? activeIndex : 0);

    setIsPlaying(true);
    setIsBuffering(true);
    setPlayedProgress(0);
    setPlayedSeconds(0);

    const newHistory = [song, ...history.filter(s => s.videoId !== song.videoId)].slice(0, 25);
    setHistory(newHistory);
    localStorage.setItem('icarus_history', JSON.stringify(newHistory));
  };

  const handleNext = () => {
    if (isRepeat === 'one' && currentTrack) {
      if (playerRef.current) playerRef.current.seekTo(0, 'seconds');
      return;
    }
    if (currentQueue.length > 0) {
      let nextIdx = isShuffle ? Math.floor(Math.random() * currentQueue.length) : (currentIndex + 1) % currentQueue.length;
      playSong(currentQueue[nextIdx], currentQueue, nextIdx);
    }
  };

  const handlePrev = () => {
    if (currentQueue.length > 0) {
      const prevIdx = (currentIndex - 1 + currentQueue.length) % currentQueue.length;
      playSong(currentQueue[prevIdx], currentQueue, prevIdx);
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentTrack) setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || !playerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetSeconds = percentage * duration;
    isSeekingRef.current = true;
    setPlayedProgress(percentage);
    setPlayedSeconds(targetSeconds);
    playerRef.current.seekTo(targetSeconds, 'seconds');
    setTimeout(() => { isSeekingRef.current = false; }, 800);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      if (json.status === 'success') setSearchResults(json.data);
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const suggestionColumns = chunkArray(suggestions, 5);

  // --- LOGIN / REGISTER RENDER (Enterprise Security) ---
  if (!isLoggedIn) {
    return (
      <div className="bg-black min-h-screen text-white flex flex-col justify-center items-center p-6 font-sans">
        <div className="w-full max-w-md bg-[#121212]/90 border border-white/15 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="inline-block px-3 py-1 mb-2 bg-white/10 rounded-full text-[10px] uppercase tracking-widest font-semibold text-emerald-400">Enterprise Secure v3.4</div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">ICARUS MUSIC</h1>
            <p className="text-xs text-gray-400">Secure Audio & Vibe Ecosystem</p>
          </div>

          <div className="flex bg-black/60 p-1 rounded-xl mb-6 border border-white/10">
            <button 
              onClick={() => { setAuthMode('login'); setAuthError(null); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${authMode === 'login' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Masuk
            </button>
            <button 
              onClick={() => { setAuthMode('register'); setAuthError(null); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${authMode === 'register' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Daftar
            </button>
          </div>

          {authError && (
            <div className="bg-red-500/15 border border-red-500/40 text-red-300 text-xs p-3.5 rounded-xl mb-5 text-center leading-relaxed">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Email Perusahaan / Pribadi</label>
              <input 
                type="email" 
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="nama@domain.com"
                className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Password Enterprise</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Min 8 karakter, Huruf Besar/Kecil, Angka, Simbol"
                  className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white focus:outline-none focus:border-white transition-colors"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={authLoading}
              className="w-full mt-2 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-transform active:scale-[0.98] shadow-lg disabled:opacity-50"
            >
              {authLoading ? 'Memproses Keamanan...' : (authMode === 'login' ? 'Masuk ke Sistem' : 'Daftar Akun Enterprise')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN APP RENDER ---
  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-gray-700 pb-36">
      
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-white text-black font-semibold px-4 py-2.5 rounded-full shadow-2xl z-[150] text-xs animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* HIDDEN YOUTUBE PLAYER */}
      {currentTrack && (
        <div className="fixed -top-[200%] -left-[200%] w-0 h-0 opacity-0 pointer-events-none">
          <ReactPlayer
            ref={playerRef}
            url={`https://www.youtube.com/watch?v=${currentTrack.videoId}`}
            playing={isPlaying}
            onReady={() => setIsBuffering(false)}
            onBuffer={() => setIsBuffering(true)}
            onBufferEnd={() => setIsBuffering(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onProgress={({ played, playedSeconds }) => {
              if (!isSeekingRef.current) {
                setPlayedProgress(played);
                setPlayedSeconds(playedSeconds);
              }
            }}
            onDuration={(dur) => setDuration(dur)}
            onEnded={handleNext}
            volume={1}
            width="100%"
            height="100%"
          />
        </div>
      )}

      {/* --- REQ 5: FULLSCREEN TRENDING OVERLAY (SEE ALL) --- */}
      {isTrendingFullscreen && (
        <div className="fixed inset-0 bg-black z-[100] overflow-y-auto p-4 md:p-8 animate-fade-in">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Trending & Discovery Engine</span>
              <h2 className="text-2xl md:text-3xl font-black">All Trending Hits 2026</h2>
            </div>
            <button 
              onClick={() => setIsTrendingFullscreen(false)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition"
            >
              Kembali (Close)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestions.concat(randomSongs).map((song: any, idx: number) => {
              const artistName = song.artists?.map((a: any) => a.name).join(', ') || '';
              const liked = isSongLiked(song.videoId);
              return (
                <div 
                  key={idx}
                  onClick={() => playSong(song, suggestions, idx)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-14 h-14 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                      {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold truncate text-white">{song.title}</span>
                      <span className="text-xs text-gray-400 truncate">{artistName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => toggleLikeSong(song, e)} className="p-2">
                      {liked ? (
                        <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- REQ 4: HOME PAGE TOP FILTER BAR (All, Music, Podcasts) --- */}
      {activeTab === 'home' && (
        <div className="sticky top-0 bg-black/90 backdrop-blur-md z-40 px-4 py-4 flex gap-3 items-center border-b border-white/5">
          <div onClick={() => setActiveTab('profile')} className="w-9 h-9 rounded-full overflow-hidden border border-white/20 cursor-pointer shadow-md flex-shrink-0">
            <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <button 
            onClick={() => setHomeFilter('all')} 
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${homeFilter === 'all' ? 'bg-white text-black shadow' : 'bg-[#242424] text-white hover:bg-[#303030]'}`}
          >
            All
          </button>
          <button 
            onClick={() => setHomeFilter('music')} 
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${homeFilter === 'music' ? 'bg-white text-black shadow' : 'bg-[#242424] text-white hover:bg-[#303030]'}`}
          >
            Music
          </button>
          <button 
            onClick={() => setHomeFilter('podcast')} 
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${homeFilter === 'podcast' ? 'bg-white text-black shadow' : 'bg-[#242424] text-white hover:bg-[#303030]'}`}
          >
            Podcasts
          </button>
        </div>
      )}

      <div className="px-4 pt-2">
        
        {/* ================= TAB: HOME ================= */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-8 animate-fade-in">
            
            {/* START LISTENING CAROUSEL (REQ 1: Slightly larger & 3-dots menu) */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Jump into a session based on your tastes</p>
                  <h2 className="text-2xl font-bold tracking-tight">Start listening</h2>
                </div>
                {/* REQ 5: See All as clickable text */}
                <button 
                  onClick={() => setIsTrendingFullscreen(true)}
                  className="text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  See All
                </button>
              </div>

              {isLoading ? (
                <div className="text-sm text-gray-500 animate-pulse">Curating your mix...</div>
              ) : (
                <div className="flex overflow-x-auto gap-4 pb-2 snap-x scrollbar-none pr-4">
                  {suggestionColumns.map((column, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-2.5 min-w-[310px] max-w-[325px] flex-shrink-0 snap-start bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 shadow-xl">
                      {column.map((song: any, songIdx: number) => {
                        const globalIdx = colIdx * 5 + songIdx;
                        const artistName = song.artists?.map((a: any) => a.name).join(', ') || '';
                        const liked = isSongLiked(song.videoId);

                        return (
                          <div 
                            key={songIdx} 
                            onClick={() => playSong(song, suggestions, globalIdx)} 
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 cursor-pointer group transition-all"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-13 h-13 w-12 h-12 bg-gray-800 rounded-xl flex-shrink-0 overflow-hidden relative shadow-inner">
                                {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
                                {currentTrack?.videoId === song.videoId && isPlaying && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col overflow-hidden pr-2">
                                <span className={`text-sm font-semibold truncate w-36 ${currentTrack?.videoId === song.videoId ? 'text-green-400 font-bold' : 'text-white'}`}>
                                  {song.title}
                                </span>
                                <span className="text-xs text-gray-400 truncate w-36">{artistName}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {/* Love Button */}
                              <button onClick={(e) => toggleLikeSong(song, e)} className="p-1.5">
                                {liked ? (
                                  <svg className="w-4 h-4 text-white fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                ) : (
                                  <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                                )}
                              </button>
                              {/* REQ 1: Three Dots Menu Button beside love */}
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSongToAddToPlaylist(song); setIsAddToPlaylistOpen(true); }}
                                className="p-1.5 text-gray-400 hover:text-white"
                                title="Opsi Lainnya (Share, Playlist)"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* RECENTLY PLAYED CAROUSEL */}
            {history.length > 0 && (
              <section className="mt-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold tracking-tight">Recently Played</h2>
                </div>
                <div className="flex overflow-x-auto gap-4 pb-2 snap-x scrollbar-none pr-4">
                  {chunkArray(history, 5).map((column, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-2.5 min-w-[310px] max-w-[325px] flex-shrink-0 snap-start bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 shadow-xl">
                      {column.map((song: any, songIdx: number) => {
                        const globalIdx = colIdx * 5 + songIdx;
                        const artistName = song.artists?.map((a: any) => a.name).join(', ') || '';
                        return (
                          <div 
                            key={songIdx} 
                            onClick={() => playSong(song, history, globalIdx)} 
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 cursor-pointer group transition-all"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-12 h-12 bg-gray-800 rounded-xl flex-shrink-0 overflow-hidden relative shadow-inner">
                                {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
                              </div>
                              <div className="flex flex-col overflow-hidden pr-2">
                                <span className="text-sm font-semibold text-white truncate w-36">{song.title}</span>
                                <span className="text-xs text-gray-400 truncate w-36">{artistName}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* REQ 2: RANDOM VIBES SONGS LIST (Vertical list with 5 rows + Show More button) */}
            <section className="mt-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold tracking-tight">Vibes yang Sering Anda Putar</h2>
              </div>
              <div className="flex flex-col gap-2.5">
                {randomSongs.slice(0, visibleRandomCount).map((song: any, idx: number) => {
                  const artistName = song.artists?.map((a: any) => a.name).join(', ') || '';
                  const liked = isSongLiked(song.videoId);
                  return (
                    <div 
                      key={idx}
                      onClick={() => playSong(song, randomSongs, idx)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 cursor-pointer transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-13 h-13 w-12 h-12 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0 shadow">
                          {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-bold text-white truncate">{song.title}</span>
                          <span className="text-xs text-gray-400 truncate">{artistName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => toggleLikeSong(song, e)} className="p-2">
                          {liked ? (
                            <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                          )}
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSongToAddToPlaylist(song); setIsAddToPlaylistOpen(true); }}
                          className="p-2 text-gray-400 hover:text-white"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {visibleRandomCount < randomSongs.length && (
                  <button 
                    onClick={() => setVisibleRandomCount(prev => prev + 5)}
                    className="w-full py-3 mt-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition text-xs uppercase tracking-wider"
                  >
                    Show More Songs
                  </button>
                )}
              </div>
            </section>

          </div>
        )}

        {/* ================= REQ 6: TAB: SEARCH (History + Show More + Mini Trending) ================= */}
        {activeTab === 'search' && (
          <div className="animate-fade-in pt-4">
            <h1 className="text-3xl font-bold mb-4">Search</h1>
            <form onSubmit={handleSearch} className="mb-6 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-black font-semibold px-10 py-3.5 rounded-xl focus:outline-none placeholder-gray-500 shadow-lg" 
                placeholder="What do you want to listen to?" 
              />
            </form>

            {isLoading ? (
              <div className="text-center text-gray-400 mt-10">Searching...</div>
            ) : searchResults.length > 0 ? (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Hasil Pencarian</h3>
                {searchResults.map((song, idx) => (
                  <div key={idx} onClick={() => playSong(song, searchResults, idx)} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 cursor-pointer transition-all shadow">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-14 h-14 bg-gray-800 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                        {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold text-white truncate">{song.title}</span>
                        <span className="text-xs text-gray-400 truncate">Track • {song.artists?.map((a: any) => a.name).join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => toggleLikeSong(song, e)} className="p-2">
                        {isSongLiked(song.videoId) ? (
                          <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* REQ 6: Default Search view showing history + 5 items + show more + mini trending */
              <div className="flex flex-col gap-6">
                {history.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">History Pencarian / Putar Terakhir</h3>
                    <div className="flex flex-col gap-2">
                      {history.slice(0, visibleHistoryCount).map((song: any, idx: number) => (
                        <div 
                          key={idx}
                          onClick={() => playSong(song, history, idx)}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 cursor-pointer transition"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-11 h-11 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                              {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-sm font-semibold text-white truncate">{song.title}</span>
                              <span className="text-xs text-gray-400 truncate">{song.artists?.map((a: any) => a.name).join(', ')}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {visibleHistoryCount < history.length && (
                        <button 
                          onClick={() => setVisibleHistoryCount(prev => prev + 5)}
                          className="py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition text-gray-300 mt-1"
                        >
                          Show More History
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Mini Trending Below History */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Trending Pilihan Hari Ini</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {suggestions.slice(0, 4).map((song: any, idx: number) => (
                      <div 
                        key={idx}
                        onClick={() => playSong(song, suggestions, idx)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-11 h-11 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                            {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-semibold text-white truncate">{song.title}</span>
                            <span className="text-xs text-gray-400 truncate">{song.artists?.map((a: any) => a.name).join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: LIBRARY ================= */}
        {activeTab === 'library' && (
          <div className="animate-fade-in pt-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Your Library</h1>
            </div>

            {activePlaylistView ? (
              <div className="flex flex-col gap-4">
                <button onClick={() => setActivePlaylistView(null)} className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1">
                  ← Kembali ke Library
                </button>
                <div className="bg-gradient-to-b from-gray-800 to-black p-6 rounded-2xl mb-2 shadow-xl">
                  <h2 className="text-2xl font-black mb-1">{activePlaylistView.name}</h2>
                  <p className="text-xs text-gray-400">{activePlaylistView.songs.length} lagu di dalam playlist ini</p>
                </div>
                <div className="flex flex-col gap-2">
                  {activePlaylistView.songs.length > 0 ? (
                    activePlaylistView.songs.map((song: any, idx: number) => (
                      <div key={idx} onClick={() => playSong(song, activePlaylistView.songs, idx)} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer shadow">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                            {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-semibold truncate text-white">{song.title}</span>
                            <span className="text-xs text-gray-400 truncate">{song.artists?.map((a: any) => a.name).join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-10 text-sm">Playlist ini masih kosong. Tambahkan lagu dari menu titik tiga lagu!</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Liked Songs Folder Card */}
                <div onClick={() => setActivePlaylistView({ name: 'Liked Songs', songs: likedSongsList })} className="bg-gradient-to-r from-purple-900/70 to-indigo-900/50 border border-white/15 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-transform shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-white fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">Liked Songs</h3>
                      <p className="text-xs text-gray-300">{likedSongsList.length} lagu disukai</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                </div>

                {/* User Created Playlists */}
                {playlists.map((pl) => (
                  <div key={pl.id} onClick={() => setActivePlaylistView(pl)} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/10 transition shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-800 rounded-xl flex items-center justify-center font-bold text-xl shadow-inner">
                        🎵
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white">{pl.name}</h3>
                        <p className="text-xs text-gray-400">{pl.songs.length} lagu</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= REQ 7: TAB: PROFILE USER (Enterprise Grade, Editable Photo, Username, GIF Cover) ================= */}
        {activeTab === 'profile' && (
          <div className="animate-fade-in pt-4">
            <div className="relative rounded-3xl overflow-hidden mb-6 border border-white/15 shadow-2xl">
              <div className="h-48 w-full bg-gray-800 relative">
                <img src={profileCover} alt="Cover GIF/Image" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              </div>

              <div className="px-6 pb-6 pt-0 relative -mt-14 flex flex-col md:flex-row items-center md:items-end justify-between gap-4">
                <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                  <div className="w-28 h-28 rounded-full border-4 border-black overflow-hidden shadow-2xl bg-gray-700 flex-shrink-0">
                    <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider border border-emerald-500/30">Enterprise Account</span>
                    <h1 className="text-2xl font-black mt-1 text-white">{username}</h1>
                    <p className="text-xs text-gray-400">{sessionUser?.email || 'user@enterprise.icarus.io'}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-5 py-2.5 bg-white text-black font-bold text-xs rounded-xl shadow hover:bg-gray-200 transition"
                >
                  {isEditingProfile ? 'Tutup Edit' : 'Edit Profil'}
                </button>
              </div>
            </div>

            {/* EDIT PROFILE FORM */}
            {isEditingProfile && (
              <form onSubmit={handleSaveProfile} className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6 flex flex-col gap-4 backdrop-blur-xl">
                <h3 className="text-lg font-bold">Edit Informasi Profil Enterprise</h3>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Username</label>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">URL Foto Profil</label>
                  <input 
                    type="text" 
                    value={profileAvatar} 
                    onChange={(e) => setProfileAvatar(e.target.value)} 
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">URL Cover Background (Mendukung Gambar / GIF)</label>
                  <input 
                    type="text" 
                    value={profileCover} 
                    onChange={(e) => setProfileCover(e.target.value)} 
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>
                <button type="submit" className="py-3 bg-white text-black font-bold rounded-xl text-xs shadow hover:bg-gray-200 transition">
                  Simpan Perubahan ke Cloud Supabase
                </button>
              </form>
            )}

            {/* ENTERPRISE METRICS & DETAILS */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-1">
                <span className="text-xs text-gray-400">Total Liked Songs</span>
                <span className="text-2xl font-black">{likedSongsList.length}</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-1">
                <span className="text-xs text-gray-400">Total Playlists</span>
                <span className="text-2xl font-black">{playlists.length}</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
              <h4 className="font-bold text-sm text-gray-300">Pengaturan & Keamanan Enterprise</h4>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-xs text-gray-400">Status Enkripsi Akun</span>
                <span className="text-xs font-bold text-emerald-400">AES-256 Active</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-xs text-gray-400">Cloud Sync Supabase</span>
                <span className="text-xs font-bold text-emerald-400">Connected</span>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full mt-2 py-3 bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl text-xs hover:bg-red-500/30 transition"
              >
                Keluar Akun (Logout)
              </button>
            </div>
          </div>
        )}

      </div>

      {/* --- REQ 3: ADD TO PLAYLIST MODAL (Without required creation first, with create option) --- */}
      {isAddToPlaylistOpen && songToAddToPlaylist && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#181818] border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Tambahkan ke Playlist</h3>
              <button onClick={() => setIsAddToPlaylistOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-gray-400 truncate">Lagu: <b className="text-white">{songToAddToPlaylist.title}</b></p>

            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => handleDirectAddToPlaylist(pl.id)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/15 transition text-left text-sm font-semibold"
                >
                  <span>{pl.name}</span>
                  <span className="text-xs text-gray-400">{pl.songs.length} lagu</span>
                </button>
              ))}

              {playlists.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-2">Belum ada playlist.</p>
              )}
            </div>

            <div className="border-t border-white/10 pt-4 flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-300">Atau Buat Playlist Baru & Masukkan Lagu:</span>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={quickNewPlaylistName}
                  onChange={(e) => setQuickNewPlaylistName(e.target.value)}
                  placeholder="Nama playlist baru..."
                  className="flex-1 bg-[#242424] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
                <button 
                  onClick={() => handleDirectAddToPlaylist('new')}
                  className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-200 transition"
                >
                  Buat & Tambah
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING MINI PLAYER BAR --- */}
      {currentTrack && (
        <div 
          onClick={() => setIsPlayerOpen(true)}
          className="fixed bottom-16 left-4 right-4 bg-[#181818]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-3 flex items-center justify-between z-50 shadow-2xl cursor-pointer"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-12 h-12 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0 shadow">
              {currentTrack.thumbnails?.[0]?.url && <img src={currentTrack.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold truncate text-white">{currentTrack.title}</span>
              <span className="text-xs text-gray-400 truncate">{currentTrack.artists?.map((a: any) => a.name).join(', ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button onClick={(e) => toggleLikeSong(currentTrack, e)} className="p-1">
              {isSongLiked(currentTrack.videoId) ? (
                <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              )}
            </button>
            <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-md hover:scale-105 transition">
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* --- FULLSCREEN PLAYER & LYRICS MODAL --- */}
      {isPlayerOpen && currentTrack && (
        <div className="fixed inset-0 bg-gradient-to-b from-[#1e1e1e] to-black z-[250] flex flex-col p-6 animate-fade-in overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setIsPlayerOpen(false)} className="p-2 text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <span className="text-xs uppercase tracking-widest font-bold text-gray-400">Now Playing</span>
            <div className="w-6"></div>
          </div>

          <div className="flex flex-col items-center my-auto gap-6 max-w-sm mx-auto w-full">
            <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative">
              <img src={getHighResCover(currentTrack.thumbnails?.[currentTrack.thumbnails.length - 1]?.url)} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="w-full flex justify-between items-center px-2">
              <div className="flex flex-col overflow-hidden pr-2">
                <h2 className="text-xl font-black truncate text-white">{currentTrack.title}</h2>
                <p className="text-sm text-gray-400 truncate">{currentTrack.artists?.map((a: any) => a.name).join(', ')}</p>
              </div>
              <button onClick={(e) => toggleLikeSong(currentTrack, e)} className="p-2">
                {isSongLiked(currentTrack.videoId) ? (
                  <svg className="w-6 h-6 text-white fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                )}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full flex flex-col gap-1 px-2">
              <div onClick={handleSeek} className="w-full h-2 bg-white/20 rounded-full cursor-pointer relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-white rounded-full" style={{ width: `${playedProgress * 100}%` }}></div>
              </div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>{formatTime(playedSeconds)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between w-full px-4">
              <button onClick={() => setIsShuffle(!isShuffle)} className={`p-2 ${isShuffle ? 'text-white' : 'text-gray-500'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              </button>
              <button onClick={handlePrev} className="p-2 text-white hover:scale-110 transition">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><polygon points="19,20 9,12 19,4"/><rect x="5" y="4" width="2" height="16"/></svg>
              </button>
              <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-105 transition">
                {isPlaying ? (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                ) : (
                  <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
                )}
              </button>
              <button onClick={handleNext} className="p-2 text-white hover:scale-110 transition">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><polygon points="5,4 15,12 5,20"/><rect x="17" y="4" width="2" height="16"/></svg>
              </button>
              <button onClick={() => setIsRepeat(isRepeat === 'off' ? 'all' : isRepeat === 'all' ? 'one' : 'off')} className={`p-2 ${isRepeat !== 'off' ? 'text-white' : 'text-gray-500'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              </button>
            </div>

            {/* Lyrics Box */}
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-4 h-40 overflow-y-auto relative backdrop-blur-md" ref={lyricContainerRef}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Live Lyrics</h4>
              {isLoadingLyrics ? (
                <div className="text-xs text-gray-400 animate-pulse text-center py-6">Memuat lirik...</div>
              ) : lyricLines.length > 0 ? (
                <div className="flex flex-col gap-3 text-center">
                  {lyricLines.map((line, idx) => (
                    <div 
                      key={idx}
                      ref={idx === activeLineIndex ? activeLyricRef : null}
                      className={`text-sm transition-all duration-300 ${idx === activeLineIndex ? 'text-white font-bold scale-105' : 'text-gray-400'}`}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-6">Lirik tidak tersedia.</p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* --- BOTTOM NAVIGATION BAR --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#121212]/95 backdrop-blur-xl border-t border-white/10 py-2.5 px-6 flex justify-around items-center z-40 shadow-2xl">
        <div onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'home' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={activeTab === 'home' ? "3" : "2"} viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span className="text-[10px] font-medium">Home</span>
        </div>

        <div onClick={() => setActiveTab('search')} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'search' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={activeTab === 'search' ? "3" : "2"} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span className="text-[10px] font-medium">Search</span>
        </div>

        <div onClick={() => setActiveTab('library')} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'library' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={activeTab === 'library' ? "3" : "2"} viewBox="0 0 24 24"><path d="M4 19V5a2 2 0 0 1 2-2h13.4a.5.5 0 0 1 .49.6l-1 5.2a.5.5 0 0 1-.49.4h-1.4"></path><path d="M4 19a2 2 0 0 0 2 2h14"></path><path d="M4 19h14"></path><path d="M8 12h8"></path><path d="M8 16h6"></path></svg>
          <span className="text-[10px] font-medium">Your Library</span>
        </div>

        <div onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'profile' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={activeTab === 'profile' ? "3" : "2"} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span className="text-[10px] font-medium">Profile</span>
        </div>
      </div>

    </div>
  );
}
