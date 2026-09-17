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
  // --- AUTH STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authInput, setAuthInput] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // --- USER PROFILE STATES ---
  const [userEmail, setUserEmail] = useState('');
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [coverPic, setCoverPic] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [followersCount, setFollowersCount] = useState(1280);
  const [followingCount, setFollowingCount] = useState(342);
  
  // Toggle Edit Profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [tempProfilePic, setTempProfilePic] = useState('');
  const [tempCoverPic, setTempCoverPic] = useState('');

  // --- APP NAVIGATION & STATES ---
  const [activeTab, setActiveTab] = useState('home'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [randomSongs, setRandomSongs] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- LIBRARY & PLAYLIST STATES ---
  const [likedSongIds, setLikedSongIds] = useState<string[]>([]);
  const [likedSongsList, setLikedSongsList] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<{ id: string; name: string; songs: any[] }[]>([]);
  const [activePlaylistView, setActivePlaylistView] = useState<any | null>(null);

  // Modal States
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState<any | null>(null);

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

  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  // Load Initial LocalStorage & Supabase Data
  useEffect(() => {
    const userAuth = localStorage.getItem('icarus_logged_in');
    if (userAuth === 'true') setIsLoggedIn(true);

    const savedEmail = localStorage.getItem('icarus_email') || '';
    setUserEmail(savedEmail);

    const savedUsername = localStorage.getItem('icarus_username') || '';
    setUsername(savedUsername);
    setTempUsername(savedUsername);

    const savedPic = localStorage.getItem('icarus_profile_pic') || '';
    setProfilePic(savedPic);
    setTempProfilePic(savedPic);

    const savedCover = localStorage.getItem('icarus_cover_pic') || '';
    setCoverPic(savedCover);
    setTempCoverPic(savedCover);

    const savedFollowers = parseInt(localStorage.getItem('icarus_followers') || '1280');
    setFollowersCount(savedFollowers);

    const savedFollowing = parseInt(localStorage.getItem('icarus_following') || '342');
    setFollowingCount(savedFollowing);

    const savedHistory = JSON.parse(localStorage.getItem('icarus_history') || '[]');
    setHistory(savedHistory);

    const savedLikes = JSON.parse(localStorage.getItem('icarus_liked_ids') || '[]');
    setLikedSongIds(savedLikes);
    const savedLikedFull = JSON.parse(localStorage.getItem('icarus_liked_full') || '[]');
    setLikedSongsList(savedLikedFull);

    const savedPlaylists = JSON.parse(localStorage.getItem('icarus_playlists') || '[]');
    setPlaylists(savedPlaylists);

    loadHomepageData();
  }, []);

  // Fetch Verification & User Profile from Supabase
  useEffect(() => {
    const fetchSupabaseProfile = async () => {
      if (!userEmail) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', userEmail)
          .single();

        if (data) {
          if (data.is_verified || data.verified || data.verification) {
            setIsVerified(true);
            localStorage.setItem('icarus_is_verified', 'true');
          }
          if (data.username) {
            setUsername(data.username);
            setTempUsername(data.username);
          }
        }
      } catch (err) {
        // Fallback check localstorage if supabase query fails or table doesn't exist yet
        const savedVerified = localStorage.getItem('icarus_is_verified') === 'true';
        setIsVerified(savedVerified);
      }
    };
    fetchSupabaseProfile();
  }, [userEmail]);

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
      const res1 = await fetch(`/api/search?q=Global Viral Hits 2026`);
      const json1 = await res1.json();
      if (json1.status === 'success') setSuggestions(json1.data.slice(0, 15));

      const res2 = await fetch(`/api/search?q=Trending Chill Mix`);
      const json2 = await res2.json();
      if (json2.status === 'success') setRandomSongs(json2.data.slice(0, 15));
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  // --- HELPER: CONVERT DEVICE FILE TO BASE64 ---
  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- HELPER: RENDER PROFILE AVATAR WITH VERIFIED RING ---
  const renderAvatar = (customClass = "w-8 h-8 text-xs font-bold") => {
    return (
      <div className="relative inline-block flex-shrink-0">
        {profilePic.trim() ? (
          <img src={profilePic} alt="Profile" className={`${customClass} rounded-full object-cover ${isVerified ? 'border-2 border-blue-500 shadow-md shadow-blue-500/30' : ''}`} />
        ) : (
          <div className={`${customClass} rounded-full bg-gradient-to-tr from-gray-600 to-gray-400 flex items-center justify-center text-white uppercase shadow-md ${isVerified ? 'border-2 border-blue-500 shadow-md shadow-blue-500/30' : ''}`}>
            {username.trim() ? (
              username.trim().split(' ').length > 1 ? `${username.trim().split(' ')[0][0]}${username.trim().split(' ')[1][0]}` : username.trim().substring(0, 2)
            ) : userEmail.trim() ? (
              userEmail.split('@')[0].substring(0, 2)
            ) : 'ME'}
          </div>
        )}
        {isVerified && (
          <span className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-0.5 shadow flex items-center justify-center w-4 h-4 text-[9px] font-bold border border-black">
            ✓
          </span>
        )}
      </div>
    );
  };

  // --- AUTH HANDLER ---
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!authInput || !authPassword) {
      setAuthError("Semua kolom harus diisi!");
      return;
    }

    if (authMode === 'register') {
      const strongRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
      if (!strongRegex.test(authPassword)) {
        setAuthError("Password harus minimal 8 karakter dan mengandung kombinasi huruf & angka.");
        return;
      }
    }

    localStorage.setItem('icarus_logged_in', 'true');
    localStorage.setItem('icarus_email', authInput);
    setUserEmail(authInput);
    setIsLoggedIn(true);
    setToastMessage(authMode === 'login' ? "Berhasil masuk!" : "Akun berhasil dibuat & terdaftar!");
  };

  const handleLogout = () => {
    localStorage.removeItem('icarus_logged_in');
    localStorage.removeItem('icarus_email');
    localStorage.removeItem('icarus_username');
    localStorage.removeItem('icarus_profile_pic');
    localStorage.removeItem('icarus_cover_pic');
    localStorage.removeItem('icarus_is_verified');
    setIsLoggedIn(false);
    setUserEmail('');
    setUsername('');
    setProfilePic('');
    setCoverPic('');
    setIsVerified(false);
    setToastMessage("Berhasil keluar akun.");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUsername(tempUsername);
    setProfilePic(tempProfilePic);
    setCoverPic(tempCoverPic);
    setIsEditingProfile(false);

    localStorage.setItem('icarus_username', tempUsername);
    localStorage.setItem('icarus_profile_pic', tempProfilePic);
    localStorage.setItem('icarus_cover_pic', tempCoverPic);
    setToastMessage("Profil berhasil diperbarui!");
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

  // --- PLAYLIST HANDLER ---
  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const newPlaylist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      songs: []
    };

    const updated = [...playlists, newPlaylist];
    setPlaylists(updated);
    localStorage.setItem('icarus_playlists', JSON.stringify(updated));
    setNewPlaylistName('');
    setIsCreatePlaylistOpen(false);
    setToastMessage("Playlist berhasil dibuat!");
  };

  const addSongToPlaylist = (playlistId: string) => {
    if (!songToAddToPlaylist) return;
    const updated = playlists.map(pl => {
      if (pl.id === playlistId) {
        if (!pl.songs.some((s: any) => s.videoId === songToAddToPlaylist.videoId)) {
          return { ...pl, songs: [...pl.songs, songToAddToPlaylist] };
        }
      }
      return pl;
    });

    setPlaylists(updated);
    localStorage.setItem('icarus_playlists', JSON.stringify(updated));
    setIsAddToPlaylistOpen(false);
    setSongToAddToPlaylist(null);
    setToastMessage("Lagu ditambahkan ke playlist!");
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

    const newHistory = [song, ...history.filter(s => s.videoId !== song.videoId)].slice(0, 20);
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
      const res = await fetch(`/api/search?q=${searchQuery}`);
      const json = await res.json();
      if (json.status === 'success') setSearchResults(json.data);
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const suggestionColumns = chunkArray(suggestions, 5);
  const historyColumns = chunkArray(history, 5);

  // --- LOGIN / REGISTER SCREEN RENDERING IF NOT LOGGED IN ---
  if (!isLoggedIn) {
    return (
      <div className="bg-black min-h-screen text-white flex flex-col justify-center items-center p-6 font-sans">
        <div className="w-full max-w-sm bg-[#121212] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">ICARUS</h1>
            <p className="text-xs text-gray-400">Your Ultimate Vibe & Music Space</p>
          </div>

          <div className="flex bg-black/50 p-1 rounded-xl mb-6 border border-white/5">
            <button 
              onClick={() => { setAuthMode('login'); setAuthError(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${authMode === 'login' ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Masuk
            </button>
            <button 
              onClick={() => { setAuthMode('register'); setAuthError(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${authMode === 'register' ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Daftar
            </button>
          </div>

          {authError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-4 text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Email atau Nomor Telepon</label>
              <input 
                type="text" 
                value={authInput}
                onChange={(e) => setAuthInput(e.target.value)}
                placeholder="nama@email.com / 0812345..."
                className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Minimal 8 karakter (huruf & angka)"
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white focus:outline-none focus:border-white transition-colors"
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

            <button type="submit" className="w-full mt-2 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-transform active:scale-[0.98]">
              {authMode === 'login' ? 'Masuk' : 'Daftar Akun'}
            </button>
          </form>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-[10px] uppercase">Atau masuk dengan</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setIsLoggedIn(true); setUserEmail('user@google.com'); localStorage.setItem('icarus_email', 'user@google.com'); setToastMessage("Berhasil masuk via Google!"); }} className="flex items-center justify-center gap-2 py-2.5 bg-[#1e1e1e] border border-white/10 rounded-xl text-xs font-semibold hover:bg-[#282828] transition-colors">
               Google
            </button>
            <button onClick={() => { setIsLoggedIn(true); setUserEmail('user@facebook.com'); localStorage.setItem('icarus_email', 'user@facebook.com'); setToastMessage("Berhasil masuk via Facebook!"); }} className="flex items-center justify-center gap-2 py-2.5 bg-[#1e1e1e] border border-white/10 rounded-xl text-xs font-semibold hover:bg-[#282828] transition-colors">
               Facebook
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP RENDER ---
  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-gray-700">
      
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-white text-black font-semibold px-4 py-2 rounded-full shadow-2xl z-[100] text-xs animate-bounce">
          {toastMessage}
        </div>
      )}

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

      {activeTab === 'home' && (
        <div className="sticky top-0 bg-black/90 backdrop-blur-md z-40 px-4 py-4 flex gap-3 items-center">
          <div onClick={() => setActiveTab('profile')} className="cursor-pointer">
            {renderAvatar("w-8 h-8 text-xs font-bold")}
          </div>
          <button className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-semibold transition hover:scale-105">All</button>
          <button className="bg-[#242424] text-white px-4 py-1.5 rounded-full text-sm font-semibold transition hover:bg-[#303030]">Music</button>
          <button className="bg-[#242424] text-white px-4 py-1.5 rounded-full text-sm font-semibold transition hover:bg-[#303030]">Podcasts</button>
        </div>
      )}

      <div className="pb-32 px-4 pt-2 overflow-y-auto">
        
        {/* --- TAB: HOME --- */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-8 animate-fade-in">
            
            <section>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Jump into a session based on your tastes</p>
                  <h2 className="text-2xl font-bold tracking-tight">Start listening</h2>
                </div>
                <button 
                  onClick={() => { setActiveTab('search'); setSearchQuery('Trending 2026'); }}
                  className="text-xs font-semibold text-gray-400 hover:text-white transition-colors uppercase tracking-wider px-3 py-1 bg-[#222] rounded-md"
                >
                  See All
                </button>
              </div>

              {isLoading ? (
                <div className="text-sm text-gray-500 animate-pulse">Curating your mix...</div>
              ) : (
                <div className="flex overflow-x-auto gap-4 pb-2 snap-x scrollbar-none pr-12">
                  {suggestionColumns.map((column, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-2 min-w-[270px] max-w-[280px] flex-shrink-0 snap-start bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-lg">
                      {column.map((song: any, songIdx: number) => {
                        const globalIdx = colIdx * 5 + songIdx;
                        const artistName = song.artists?.map((a: any) => a.name).join(', ') || '';
                        const liked = isSongLiked(song.videoId);

                        return (
                          <div 
                            key={songIdx} 
                            onClick={() => playSong(song, suggestions, globalIdx)} 
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 cursor-pointer group transition-all"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-12 h-12 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden relative shadow-inner">
                                 {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
                                 {currentTrack?.videoId === song.videoId && isPlaying && (
                                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                     <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                                   </div>
                                 )}
                              </div>
                              <div className="flex flex-col overflow-hidden pr-2">
                                <span className={`text-base font-medium truncate w-32 ${currentTrack?.videoId === song.videoId ? 'text-green-400 font-bold' : 'text-white'}`}>
                                  {song.title}
                                </span>
                                <span className="text-sm text-gray-400 truncate w-32">{artistName}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={(e) => toggleLikeSong(song, e)} className="p-1">
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
                  ))}
                </div>
              )}
            </section>

            {history.length > 0 && (
              <section className="mt-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold tracking-tight">Recently Played</h2>
                </div>
                <div className="flex overflow-x-auto gap-4 pb-2 snap-x scrollbar-none pr-12">
                  {historyColumns.map((column, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-2 min-w-[270px] max-w-[280px] flex-shrink-0 snap-start bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-lg">
                      {column.map((song: any, songIdx: number) => {
                        const globalIdx = colIdx * 5 + songIdx;
                        const artistName = song.artists?.map((a: any) => a.name).join(', ') || '';
                        return (
                          <div 
                            key={songIdx} 
                            onClick={() => playSong(song, history, globalIdx)} 
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 cursor-pointer group transition-all"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-12 h-12 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden relative shadow-inner">
                                 {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
                              </div>
                              <div className="flex flex-col overflow-hidden pr-2">
                                <span className="text-base font-medium text-white truncate w-36">{song.title}</span>
                                <span className="text-sm text-gray-400 truncate w-36">{artistName}</span>
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

          </div>
        )}

        {/* --- TAB: SEARCH --- */}
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
                className="w-full bg-white text-black font-semibold px-10 py-3 rounded-md focus:outline-none placeholder-gray-500" 
                placeholder="What do you want to listen to?" 
              />
            </form>

            <div className="flex flex-col gap-2">
               {isLoading ? (
                  <div className="text-center text-gray-400 mt-10">Searching...</div>
               ) : searchResults.length > 0 ? (
                 searchResults.map((song, idx) => (
                   <div key={idx} onClick={() => playSong(song, searchResults, idx)} className="flex items-center justify-between p-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 cursor-pointer group transition-all shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-14 h-14 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden shadow-inner">
                           {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-base font-semibold text-white truncate">{song.title}</span>
                          <span className="text-sm text-gray-400 truncate">Track • {song.artists?.map((a: any) => a.name).join(', ')}</span>
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
                 ))
               ) : (
                  <div className="text-center text-gray-500 mt-10">Cari lagu atau artis favoritmu</div>
               )}
            </div>
          </div>
        )}

        {/* --- TAB: LIBRARY --- */}
        {activeTab === 'library' && (
          <div className="animate-fade-in pt-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Your Library</h1>
              <button 
                onClick={() => setIsCreatePlaylistOpen(true)}
                className="bg-white text-black font-semibold text-xs px-4 py-2 rounded-full hover:bg-gray-200 transition-colors shadow"
              >
                + Buat Playlist
              </button>
            </div>

            {activePlaylistView ? (
              <div className="flex flex-col gap-4">
                <button onClick={() => setActivePlaylistView(null)} className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1">
                  ← Kembali ke Library
                </button>
                <div className="bg-gradient-to-b from-gray-800 to-black p-6 rounded-2xl mb-2">
                  <h2 className="text-2xl font-black mb-1">{activePlaylistView.name}</h2>
                  <p className="text-xs text-gray-400">{activePlaylistView.songs.length} lagu di dalam playlist ini</p>
                </div>

                <div className="flex flex-col gap-2">
                  {activePlaylistView.songs.length > 0 ? (
                    activePlaylistView.songs.map((song: any, idx: number) => (
                      <div key={idx} onClick={() => playSong(song, activePlaylistView.songs, idx)} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden">
                            {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-semibold truncate">{song.title}</span>
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
                <div 
                  onClick={() => setActivePlaylistView({ name: 'Liked Songs', songs: likedSongsList })}
                  className="bg-gradient-to-r from-purple-900/60 to-indigo-900/40 border border-white/10 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-transform shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-white fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">Liked Songs</h3>
                      <p className="text-xs text-gray-300">{likedSongsList.length} lagu disukai</p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm font-bold">→</span>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                  <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Playlist Kamu</h3>
                  {playlists.length > 0 ? (
                    playlists.map((pl) => (
                      <div 
                        key={pl.id} 
                        onClick={() => setActivePlaylistView(pl)}
                        className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center font-bold text-lg text-gray-400">
                            {pl.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{pl.name}</h4>
                            <p className="text-xs text-gray-400">{pl.songs.length} lagu</p>
                          </div>
                        </div>
                        <span className="text-gray-400">→</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 italic">Belum ada playlist kustom. Klik tombol "Buat Playlist" di atas.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: PROFILE --- */}
        {activeTab === 'profile' && (
          <div className="animate-fade-in pb-12">
            {/* Boxed Cover Card with Bottom Fade to Black */}
            <div className="w-full px-3 pt-3">
              <div className="w-full h-44 rounded-2xl relative overflow-hidden shadow-2xl bg-gradient-to-r from-gray-900 via-purple-950 to-black">
                {coverPic ? (
                  <img src={coverPic} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-gray-900 to-indigo-950 opacity-80" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </div>
            </div>

            <div className="px-4 flex flex-col items-center relative -mt-16 z-10">
              <div className="mb-3">
                {renderAvatar("w-24 h-24 text-2xl font-bold")}
              </div>

              <div className="flex items-center gap-1.5 mb-1">
                <h2 className="text-2xl font-bold text-white">{username || 'User Icarus'}</h2>
                {isVerified && (
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow" title="Verified Account">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-5">{userEmail || 'user@icarus.music'}</p>

              {/* Toggle Edit Profile Button / Form exactly in place */}
              {!isEditingProfile ? (
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="bg-white text-black font-bold text-xs px-6 py-2.5 rounded-full hover:bg-gray-200 transition-transform active:scale-95 shadow-md mb-6"
                >
                  Edit Profil
                </button>
              ) : (
                <form onSubmit={handleSaveProfile} className="w-full max-w-md flex flex-col gap-4 bg-[#141414] border border-white/10 p-5 rounded-2xl mb-6 shadow-2xl animate-fade-in">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Edit Profil & Perangkat</h3>
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="text-xs text-gray-400 hover:text-white">Batal</button>
                  </div>
                  
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Username</label>
                    <input 
                      type="text" 
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                      placeholder="Masukkan username..."
                      className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Foto Profil (Pilih dari Device)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleDeviceFileUpload(e, setTempProfilePic)}
                      className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white file:text-black hover:file:bg-gray-200 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Background Cover / GIF (Pilih dari Device)</label>
                    <input 
                      type="file" 
                      accept="image/*,.gif"
                      onChange={(e) => handleDeviceFileUpload(e, setTempCoverPic)}
                      className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white file:text-black hover:file:bg-gray-200 cursor-pointer"
                    />
                  </div>

                  <button type="submit" className="py-2.5 bg-white text-black font-bold rounded-xl text-xs hover:bg-gray-200 transition-colors mt-2">
                    Simpan Perubahan
                  </button>
                </form>
              )}

              {/* Stats Row: Songs, Playlists, Followers, Following */}
              <div className="grid grid-cols-4 gap-2 w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-3 mb-6 text-center shadow-lg">
                <div className="flex flex-col">
                  <span className="text-base font-bold text-white">{likedSongsList.length}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">Songs</span>
                </div>
                <div className="flex flex-col border-l border-white/10">
                  <span className="text-base font-bold text-white">{playlists.length}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">Playlists</span>
                </div>
                <div className="flex flex-col border-l border-white/10">
                  <span className="text-base font-bold text-white">{followersCount}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">Followers</span>
                </div>
                <div className="flex flex-col border-l border-white/10">
                  <span className="text-base font-bold text-white">{followingCount}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">Following</span>
                </div>
              </div>

              {/* Professional App Status & Security Settings */}
              <div className="w-full max-w-md flex flex-col gap-3">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300">Status Enkripsi Akun</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    AES-256 Active
                  </span>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300">Cloud Sync Supabase</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    Connected
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full py-3.5 bg-red-600/20 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-colors mt-2"
                >
                  Keluar Akun (Logout)
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MINI PLAYER */}
      {currentTrack && !isPlayerOpen && (
        <div 
          onClick={() => setIsPlayerOpen(true)}
          className="fixed bottom-[72px] left-2 right-2 bg-[#2a2a2a] rounded-md p-2 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.8)] z-50 cursor-pointer hover:bg-[#333333] transition-colors"
        >
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            <div className="w-10 h-10 bg-black rounded overflow-hidden flex-shrink-0">
               {currentTrack.thumbnails?.[0]?.url && <img src={currentTrack.thumbnails[0].url} alt="cover" className="w-full h-full object-cover" />}
            </div>
            <div className="flex flex-col overflow-hidden">
               <span className="text-sm font-semibold text-white truncate">{currentTrack.title}</span>
               <span className="text-xs text-gray-300 truncate">{currentTrack.artists?.map((a: any) => a.name).join(', ')}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-2 text-white">
            <button onClick={(e) => toggleLikeSong(currentTrack, e)} className="p-1">
              {isSongLiked(currentTrack.videoId) ? (
                <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              )}
            </button>
            <div onClick={togglePlay} className="p-2 cursor-pointer">
              {isBuffering ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </div>
          </div>
          
          <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-gray-600 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-300 ease-linear" style={{ width: `${playedProgress * 100}%` }}></div>
          </div>
        </div>
      )}

      {/* FULL SCREEN PLAYER */}
      <div 
        className={`fixed inset-0 z-[60] bg-gradient-to-b from-[#2a2a2a] to-black text-white flex flex-col transition-transform duration-300 ease-in-out overflow-y-auto pb-8 ${
          isPlayerOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {currentTrack && (
          <>
            <div className="flex items-center justify-between px-6 py-6 sticky top-0 bg-[#2a2a2a]/90 backdrop-blur-md z-10">
              <button onClick={() => setIsPlayerOpen(false)} className="p-2 -ml-2">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
              </button>
              <div className="text-center flex flex-col">
                 <span className="text-[10px] uppercase tracking-widest text-gray-300">Playing from Icarus</span>
                 <span className="text-xs font-bold">Start listening</span>
              </div>
              <button onClick={() => setIsMenuOpen(true)} className="p-2 -mr-2 text-white hover:text-gray-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
              </button>
            </div>

            <div className="px-8 mt-2 flex flex-col items-center">
              <div className="w-full aspect-square bg-gray-900 shadow-2xl mb-10 overflow-hidden rounded-md">
                {currentTrack.thumbnails?.[0]?.url && (
                  <img src={getHighResCover(currentTrack.thumbnails[currentTrack.thumbnails.length - 1].url)} alt="cover" className="w-full h-full object-cover" />
                )}
              </div>

              <div className="w-full flex justify-between items-center mb-8">
                <div className="overflow-hidden mr-4">
                  <h2 className="text-2xl font-bold truncate text-white mb-1">{currentTrack.title}</h2>
                  <p className="text-gray-400 text-lg truncate">{currentTrack.artists?.map((a: any) => a.name).join(', ')}</p>
                </div>
                <button onClick={(e) => toggleLikeSong(currentTrack, e)}>
                  {isSongLiked(currentTrack.videoId) ? (
                    <svg className="w-7 h-7 text-white fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  ) : (
                    <svg className="w-7 h-7 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                  )}
                </button>
              </div>

              <div className="w-full mb-6">
                <div onClick={handleSeek} className="py-2 cursor-pointer group">
                  <div className="h-[6px] bg-gray-600 rounded-full w-full relative">
                    <div className="h-full bg-white rounded-full absolute top-0 left-0 pointer-events-none" style={{ width: `${playedProgress * 100}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-gray-400 mt-1">
                  <span>{formatTime(playedSeconds)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="w-full flex items-center justify-between mb-10 px-2">
                <button onClick={() => setIsShuffle(!isShuffle)} className={`transition-colors ${isShuffle ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`}>
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                </button>
                <button onClick={handlePrev} className="text-white hover:text-gray-300">
                   <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                </button>
                <button onClick={togglePlay} className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                  {isBuffering ? (
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : isPlaying ? (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  ) : (
                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </button>
                <button onClick={handleNext} className="text-white hover:text-gray-300">
                   <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                </button>
                <button onClick={() => setIsRepeat(isRepeat === 'off' ? 'all' : isRepeat === 'all' ? 'one' : 'off')} className={`transition-colors ${isRepeat !== 'off' ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`}>
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                </button>
              </div>
            </div>

            {/* Lyrics Section */}
            <div className="px-6 mt-4 pb-12">
              <div className={`bg-[#181818] rounded-xl p-6 shadow-2xl transition-all duration-300 ${isLyricsExpanded ? 'fixed inset-4 z-50 bg-[#121212] flex flex-col' : 'min-h-[320px] max-h-[380px] overflow-hidden relative'}`}>
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-inherit pt-1 pb-3 border-b border-white/10 z-10">
                  <h3 className="text-sm font-bold tracking-wide">Lyrics</h3>
                  <button onClick={() => setIsLyricsExpanded(!isLyricsExpanded)} className="bg-black/60 p-2 rounded-full hover:bg-black transition-colors">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                  </button>
                </div>
                <div ref={lyricContainerRef} className={`relative overflow-y-auto scrollbar-none ${isLyricsExpanded ? 'flex-1 py-4 text-2xl md:text-3xl' : 'max-h-[260px] pr-2'}`}>
                  <div className="py-[120px] flex flex-col gap-4 text-xl font-bold">
                    {isLoadingLyrics ? (
                      <div className="text-gray-500 animate-pulse">Memuat lirik...</div>
                    ) : lyricLines.length > 0 ? (
                      lyricLines.map((line, idx) => {
                        const isActive = idx === activeLineIndex;
                        return (
                          <div key={idx} ref={isActive ? activeLyricRef : null} className={`transition-all duration-300 ${isActive ? 'text-white text-2xl md:text-3xl font-extrabold' : 'text-gray-500 text-lg opacity-60'}`}>
                            {line}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 italic text-base text-center">Lirik tidak tersedia.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* THREE DOTS MENU MODAL */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end justify-center animate-fade-in" onClick={() => setIsMenuOpen(false)}>
          <div className="bg-[#242424] w-full max-w-md rounded-t-2xl p-6 flex flex-col gap-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-2"></div>
            
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-12 h-12 bg-black rounded overflow-hidden flex-shrink-0">
                {currentTrack?.thumbnails?.[0]?.url && <img src={currentTrack.thumbnails[0].url} className="w-full h-full object-cover" />}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-white text-base truncate">{currentTrack?.title}</span>
                <span className="text-xs text-gray-400 truncate">{currentTrack?.artists?.map((a:any)=>a.name).join(', ')}</span>
              </div>
            </div>

            <button onClick={() => { setSongToAddToPlaylist(currentTrack); setIsAddToPlaylistOpen(true); setIsMenuOpen(false); }} className="flex items-center gap-4 py-3 text-white font-medium hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span>Tambahkan ke Playlist...</span>
            </button>

            <button onClick={() => { toggleLikeSong(currentTrack); setIsMenuOpen(false); }} className="flex items-center gap-4 py-3 text-white font-medium hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              <span>{isSongLiked(currentTrack?.videoId) ? 'Hapus dari Liked Songs' : 'Sukai Lagu Ini (Like)'}</span>
            </button>

            <button onClick={() => setIsMenuOpen(false)} className="mt-2 w-full py-3 bg-[#333] rounded-full font-semibold text-center text-white">Tutup</button>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PLAYLIST */}
      {isCreatePlaylistOpen && (
        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsCreatePlaylistOpen(false)}>
          <form onSubmit={handleCreatePlaylist} onClick={(e) => e.stopPropagation()} className="bg-[#1c1c1c] border border-white/10 w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-lg font-bold">Buat Playlist Baru</h3>
            <input 
              type="text" 
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Nama playlist (mis: Lagu Galau 2026)"
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => setIsCreatePlaylistOpen(false)} className="flex-1 py-3 bg-[#2a2a2a] text-gray-300 font-semibold rounded-xl text-xs">Batal</button>
              <button type="submit" className="flex-1 py-3 bg-white text-black font-bold rounded-xl text-xs">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD SONG TO PLAYLIST SELECTION */}
      {isAddToPlaylistOpen && (
        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsAddToPlaylistOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-[#1c1c1c] border border-white/10 w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-lg font-bold">Pilih Playlist</h3>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {playlists.length > 0 ? (
                playlists.map((pl) => (
                  <div key={pl.id} onClick={() => addSongToPlaylist(pl.id)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer flex justify-between items-center text-sm font-medium">
                    <span>{pl.name}</span>
                    <span className="text-xs text-gray-400">{pl.songs.length} lagu</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-6">Belum ada playlist. Buat terlebih dahulu di menu Library.</p>
              )}
            </div>
            <button onClick={() => setIsAddToPlaylistOpen(false)} className="w-full py-2.5 bg-[#2a2a2a] text-gray-300 font-semibold rounded-xl text-xs mt-2">Tutup</button>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 w-full h-[64px] bg-gradient-to-t from-black via-black/95 to-black/80 px-6 flex items-center justify-between z-40 pb-2">
        <div onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'home' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-6 h-6" fill={activeTab === 'home' ? "currentColor" : "none"} stroke="currentColor" strokeWidth={activeTab === 'home' ? "0" : "2"} viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span className="text-[10px] font-medium">Home</span>
        </div>

        <div onClick={() => setActiveTab('search')} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'search' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={activeTab === 'search' ? "3" : "2"} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span className="text-[10px] font-medium">Search</span>
        </div>

        <div onClick={() => setActiveTab('library')} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'library' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={activeTab === 'library' ? "3" : "2"} viewBox="0 0 24 24"><path d="M4 19V5a2 2 0 0 1 2-2h13.4a.5.5 0 0 1 .49.6l-1 5.2a.5.5 0 0 1-.49.4h-1.4"></path><path d="M4 19a2 2 0 0 0 2 2h14"></path><path d="M4 19h14"></path><path d="M8 12h8"></path><path d="M8 16h6"></path></svg>
          <span className="text-[10px] font-medium">Library</span>
        </div>

        <div onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'profile' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          <span className="text-[10px] font-medium">Profile</span>
        </div>
      </div>
    </div>
  );
}
