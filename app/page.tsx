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
  if (url.includes('=w')) return url.replace(/=w\d+-h\d+/, '=w1080-h1080');
  if (url.includes('ytimg.com')) return url.replace('hqdefault.jpg', 'maxresdefault.jpg').replace('default.jpg', 'maxresdefault.jpg');
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
  const [session, setSession] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authInput, setAuthInput] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // --- FILTER & NAVIGATION ---
  const [activeTab, setActiveTab] = useState('home'); 
  const [homeFilter, setHomeFilter] = useState<'all' | 'music' | 'podcasts'>('all');
  const [isFullScreenTrendingOpen, setIsFullScreenTrendingOpen] = useState(false);

  // --- SEARCH & SOCIAL STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [visibleHistoryCount, setVisibleHistoryCount] = useState(5);
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // --- MUSIC CONTENT STATES ---
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [randomSongs, setRandomSongs] = useState<any[]>([]);
  const [visibleRandomCount, setVisibleRandomCount] = useState(5);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- USER PROFILE & SOCIAL STATS ---
  const [profile, setProfile] = useState<any>(null);
  const [viewedProfile, setViewedProfile] = useState<any>(null);
  const [totalFollowers, setTotalFollowers] = useState(0);
  const [totalFollowing, setTotalFollowing] = useState(0);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editBannerUrl, setEditBannerUrl] = useState('');

  // --- LIBRARY & PLAYLIST STATES ---
  const [likedSongIds, setLikedSongIds] = useState<string[]>([]);
  const [likedSongsList, setLikedSongsList] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [activePlaylistView, setActivePlaylistView] = useState<any | null>(null);
  const [playlistContributors, setPlaylistContributors] = useState<any[]>([]);

  // Modal States
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistType, setNewPlaylistType] = useState(false);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState<any | null>(null);
  const [inlinePlaylistName, setInlinePlaylistName] = useState('');

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setIsLoggedIn(true);
        fetchUserData(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setIsLoggedIn(true);
        fetchUserData(session.user.id);
      }
    });

    loadHomepageData();
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const fetchUserData = async (userId: string) => {
    const { data: profData } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profData) {
      setProfile(profData);
      setViewedProfile(profData);
      setEditFullName(profData.full_name || '');
      setEditUsername(profData.username || '');
      setEditAvatarUrl(profData.avatar_url || '');
      setEditBannerUrl(profData.banner_url || '');
    }

    const { data: likedData } = await supabase.from('liked_songs').select('song_data').eq('user_id', userId);
    if (likedData) {
      const songs = likedData.map((item: any) => item.song_data);
      setLikedSongsList(songs);
      setLikedSongIds(songs.map((s: any) => s.videoId));
    }

    const { data: plData } = await supabase.from('playlists').select('*').eq('user_id', userId);
    if (plData) setPlaylists(plData);

    const { data: followers } = await supabase.from('friendships').select('*').eq('receiver_id', userId).eq('status', 'accepted');
    const { data: following } = await supabase.from('friendships').select('*').eq('sender_id', userId).eq('status', 'accepted');
    setTotalFollowers(followers?.length || 0);
    setTotalFollowing(following?.length || 0);

    const { data: historyData } = await supabase.from('search_history').select('query').eq('user_id', userId).order('created_at', { ascending: false }).limit(10);
    if (historyData) setSearchHistory(historyData.map(h => h.query));
  };

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
          setLyrics("Lirik tidak tersedia untuk lagu ini.");
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

      const res2 = await fetch(`/api/search?q=Trending Chill Vibes`);
      const json2 = await res2.json();
      if (json2.status === 'success') setRandomSongs(json2.data.slice(0, 15));
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!authInput || !authPassword) {
      setAuthError("Semua kolom harus diisi");
      return;
    }

    if (authMode === 'register') {
      const strongRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
      if (!strongRegex.test(authPassword)) {
        setAuthError("Password minimal 8 karakter dan mengandung huruf serta angka");
        return;
      }
      const { error } = await supabase.auth.signUp({ email: authInput, password: authPassword });
      if (error) setAuthError(error.message);
      else setToastMessage("Akun berhasil dibuat. Silakan masuk.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: authInput, password: authPassword });
      if (error) setAuthError("Gagal masuk. Periksa kembali email dan kata sandi Anda.");
      else setToastMessage("Berhasil masuk");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setSession(null);
    setProfile(null);
    setToastMessage("Berhasil keluar akun");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    const { error } = await supabase.from('profiles').update({
      full_name: editFullName,
      username: editUsername,
      avatar_url: editAvatarUrl,
      banner_url: editBannerUrl
    }).eq('id', session.user.id);

    if (!error) {
      setProfile({ ...profile, full_name: editFullName, username: editUsername, avatar_url: editAvatarUrl, banner_url: editBannerUrl });
      setViewedProfile({ ...viewedProfile, full_name: editFullName, username: editUsername, avatar_url: editAvatarUrl, banner_url: editBannerUrl });
      setIsEditProfileOpen(false);
      setToastMessage("Profil berhasil diperbarui");
    }
  };

  const toggleLikeSong = async (song: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const id = song.videoId;
    let updatedIds = [...likedSongIds];
    let updatedList = [...likedSongsList];

    if (updatedIds.includes(id)) {
      updatedIds = updatedIds.filter(i => i !== id);
      updatedList = updatedList.filter(s => s.videoId !== id);
      if (session) {
        await supabase.from('liked_songs').delete().eq('user_id', session.user.id).eq('song_data->>videoId', id);
      }
      setToastMessage("Dihapus dari daftar disukai");
    } else {
      updatedIds.push(id);
      updatedList.unshift(song);
      if (session) {
        await supabase.from('liked_songs').insert([{ user_id: session.user.id, song_data: song }]);
      }
      setToastMessage("Ditambahkan ke daftar disukai");
    }

    setLikedSongIds(updatedIds);
    setLikedSongsList(updatedList);
  };

  const isSongLiked = (videoId: string) => likedSongIds.includes(videoId);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim() || !session) return;

    const { data, error } = await supabase.from('playlists').insert([{
      title: newPlaylistName.trim(),
      user_id: session.user.id,
      is_collaborative: newPlaylistType
    }]).select().single();

    if (!error && data) {
      setPlaylists([...playlists, data]);
      setNewPlaylistName('');
      setNewPlaylistType(false);
      setIsCreatePlaylistOpen(false);
      setToastMessage("Playlist berhasil dibuat");
    } else {
      setToastMessage("Gagal membuat playlist");
    }
  };

  const openPlaylistDetail = async (pl: any) => {
    setActivePlaylistView(pl);
    if (session && pl.id) {
      const { data: tracksData } = await supabase
        .from('playlist_tracks')
        .select('*, profiles:added_by(username, avatar_url)')
        .eq('playlist_id', pl.id);

      if (tracksData) {
        const songs = tracksData.map((t: any) => ({ ...t.song_data, addedByUsername: t.profiles?.username || 'Pengguna' }));
        const counts: { [key: string]: number } = {};
        tracksData.forEach((t: any) => {
          const uname = t.profiles?.username || 'Pengguna';
          counts[uname] = (counts[uname] || 0) + 1;
        });
        const total = tracksData.length;
        const contribs = Object.keys(counts).map(uname => ({
          name: uname,
          count: counts[uname],
          percentage: total > 0 ? Math.round((counts[uname] / total) * 100) : 0
        }));
        setPlaylistContributors(contribs);
        setActivePlaylistView({ ...pl, songs });
      }
    }
  };

  const addSongToPlaylist = async (playlistId: string) => {
    if (!songToAddToPlaylist || !session) return;
    const { error } = await supabase.from('playlist_tracks').insert([{
      playlist_id: playlistId,
      song_data: songToAddToPlaylist,
      added_by: session.user.id
    }]);

    if (!error) {
      setIsAddToPlaylistOpen(false);
      setSongToAddToPlaylist(null);
      setToastMessage("Lagu ditambahkan ke playlist");
    } else {
      setToastMessage("Gagal menambahkan lagu ke playlist");
    }
  };

  const handleCreateInlinePlaylistAndAdd = async () => {
    if (!inlinePlaylistName.trim() || !songToAddToPlaylist || !session) return;

    const { data: plData, error: plErr } = await supabase.from('playlists').insert([{
      title: inlinePlaylistName.trim(),
      user_id: session.user.id,
      is_collaborative: true
    }]).select().single();

    if (!plErr && plData) {
      await supabase.from('playlist_tracks').insert([{
        playlist_id: plData.id,
        song_data: songToAddToPlaylist,
        added_by: session.user.id
      }]);

      setPlaylists([...playlists, plData]);
      setInlinePlaylistName('');
      setIsAddToPlaylistOpen(false);
      setSongToAddToPlaylist(null);
      setToastMessage("Playlist baru dibuat dan lagu ditambahkan");
    }
  };

  const searchOtherUsers = async (query: string) => {
    setUserSearchQuery(query);
    if (!query.trim()) {
      setUserSearchResults([]);
      return;
    }
    const { data } = await supabase.from('profiles').select('*').ilike('username', `%${query}%`);
    setUserSearchResults(data || []);
  };

  const sendFriendRequest = async (targetId: string) => {
    if (!session) return;
    const { error } = await supabase.from('friendships').insert([{ sender_id: session.user.id, receiver_id: targetId, status: 'pending' }]);
    if (!error) setToastMessage("Permintaan pertemanan terkirim");
  };

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
    if (!searchQuery.trim()) return;
    setIsLoading(true);

    if (session) {
      await supabase.from('search_history').insert([{ user_id: session.user.id, query: searchQuery.trim() }]);
      setSearchHistory([searchQuery.trim(), ...searchHistory.filter(h => h !== searchQuery.trim())]);
    }

    try {
      const res = await fetch(`/api/search?q=${searchQuery}`);
      const json = await res.json();
      if (json.status === 'success') setSearchResults(json.data);
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const openFullScreenTrending = () => {
    setIsFullScreenTrendingOpen(true);
    setSearchQuery('');
    fetch(`/api/search?q=Global Trending Hits 2026`).then(r => r.json()).then(json => {
      if (json.status === 'success') setSearchResults(json.data);
    });
  };

  const suggestionColumns = chunkArray(suggestions, 5);
  const historyColumns = chunkArray(history, 5);

  if (!isLoggedIn) {
    return (
      <div className="bg-black min-h-screen text-white flex flex-col justify-center items-center p-6 font-sans">
        <div className="w-full max-w-sm bg-[#121212] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">ICARUS</h1>
            <p className="text-xs text-gray-400">Your Ultimate Vibe and Music Space</p>
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
                placeholder="nama@email.com"
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
                  placeholder="Minimal 8 karakter (huruf dan angka)"
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 pr-20 text-sm text-white focus:outline-none focus:border-white transition-colors"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white font-semibold"
                >
                  {showPassword ? "Sembunyikan" : "Tampilkan"}
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
            <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} className="flex items-center justify-center gap-2 py-2.5 bg-[#1e1e1e] border border-white/10 rounded-xl text-xs font-semibold hover:bg-[#282828] transition-colors">
               Google
            </button>
            <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'facebook' })} className="flex items-center justify-center gap-2 py-2.5 bg-[#1e1e1e] border border-white/10 rounded-xl text-xs font-semibold hover:bg-[#282828] transition-colors">
               Facebook
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-gray-700">
      
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-white text-black font-semibold px-4 py-2 rounded-full shadow-2xl z-[100] text-xs">
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

      {activeTab === 'home' && !isFullScreenTrendingOpen && (
        <div className="sticky top-0 bg-black/90 backdrop-blur-md z-40 px-4 py-4 flex gap-3 items-center">
          <div onClick={() => { setViewedProfile(profile); setActiveTab('profile'); }} className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-600 to-gray-400 flex items-center justify-center text-xs font-bold shadow-md cursor-pointer overflow-hidden border border-white/20">
            {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : 'ME'}
          </div>
          <button onClick={() => setHomeFilter('all')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${homeFilter === 'all' ? 'bg-white text-black' : 'bg-[#242424] text-white hover:bg-[#303030]'}`}>All</button>
          <button onClick={() => setHomeFilter('music')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${homeFilter === 'music' ? 'bg-white text-black' : 'bg-[#242424] text-white hover:bg-[#303030]'}`}>Music</button>
          <button onClick={() => setHomeFilter('podcasts')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${homeFilter === 'podcasts' ? 'bg-white text-black' : 'bg-[#242424] text-white hover:bg-[#303030]'}`}>Podcasts</button>
        </div>
      )}

      <div className="pb-32 px-4 pt-2 overflow-y-auto">

        {activeTab === 'home' && !isFullScreenTrendingOpen && (
          <div className="flex flex-col gap-8 animate-fade-in">
            
            {homeFilter !== 'podcasts' && (
              <section>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Jump into a session based on your tastes</p>
                    <h2 className="text-2xl font-bold tracking-tight">Start listening</h2>
                  </div>
                  <span 
                    onClick={openFullScreenTrending}
                    className="text-xs font-bold text-gray-400 hover:text-white cursor-pointer uppercase tracking-wider transition-colors"
                  >
                    See All
                  </span>
                </div>

                {isLoading ? (
                  <div className="text-sm text-gray-500 animate-pulse">Curating your mix...</div>
                ) : (
                  <div className="flex overflow-x-auto gap-4 pb-2 snap-x scrollbar-none pr-12">
                    {suggestionColumns.map((column, colIdx) => (
                      <div key={colIdx} className="flex flex-col gap-2 min-w-[300px] max-w-[310px] flex-shrink-0 snap-start bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-lg">
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
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setCurrentTrack(song); setIsMenuOpen(true); }}
                                  className="p-1 text-gray-400 hover:text-white"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
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
            )}

            {history.length > 0 && homeFilter !== 'podcasts' && (
              <section className="mt-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold tracking-tight">Recently Played</h2>
                </div>
                <div className="flex overflow-x-auto gap-4 pb-2 snap-x scrollbar-none pr-12">
                  {historyColumns.map((column, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-2 min-w-[300px] max-w-[310px] flex-shrink-0 snap-start bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-lg">
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
                            <button 
                              onClick={(e) => { e.stopPropagation(); setCurrentTrack(song); setIsMenuOpen(true); }}
                              className="p-1 text-gray-400 hover:text-white"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {homeFilter !== 'podcasts' && (
              <section className="mt-4">
                <h2 className="text-xl font-bold tracking-tight mb-3">Recommended Vibes For You</h2>
                <div className="flex flex-col gap-1">
                  {randomSongs.slice(0, visibleRandomCount).map((song, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => playSong(song, randomSongs, idx)}
                      className="flex items-center justify-between py-2.5 px-2 hover:bg-white/5 cursor-pointer transition-all border-b border-white/5"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                          {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-semibold truncate">{song.title}</span>
                          <span className="text-xs text-gray-400 truncate">{song.artists?.map((a: any) => a.name).join(', ')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => toggleLikeSong(song, e)} className="p-1">
                          {isSongLiked(song.videoId) ? (
                            <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                          )}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setCurrentTrack(song); setIsMenuOpen(true); }} className="p-1 text-gray-400 hover:text-white">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {visibleRandomCount < randomSongs.length && (
                  <button 
                    onClick={() => setVisibleRandomCount(prev => prev + 5)}
                    className="mt-4 text-xs font-bold text-gray-400 hover:text-white block mx-auto py-2 px-5 bg-zinc-900 rounded-full border border-zinc-800"
                  >
                    Show More
                  </button>
                )}
              </section>
            )}

            {homeFilter === 'podcasts' && (
              <div className="py-12 text-center text-gray-400">
                <p className="text-sm">Podcast dan acara bincang-bincang akan muncul di sini.</p>
              </div>
            )}

          </div>
        )}

        {isFullScreenTrendingOpen && (
          <div className="fixed inset-0 bg-black z-50 overflow-y-auto p-6 flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">Global Trending Hits 2026</h2>
              <button 
                onClick={() => setIsFullScreenTrendingOpen(false)}
                className="bg-zinc-800 text-white text-xs px-4 py-2 rounded-full font-bold"
              >
                Tutup
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {searchResults.map((song, idx) => (
                <div key={idx} onClick={() => playSong(song, searchResults, idx)} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img src={song.thumbnails?.[0]?.url} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-semibold text-sm truncate">{song.title}</span>
                      <span className="text-xs text-gray-400 truncate">{song.artists?.map((a: any) => a.name).join(', ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'search' && !isFullScreenTrendingOpen && (
          <div className="animate-fade-in pt-4">
            <h1 className="text-3xl font-bold mb-4">Search</h1>
            <form onSubmit={handleSearch} className="mb-6 relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-black font-semibold px-4 py-3 rounded-xl focus:outline-none placeholder-gray-500 text-sm" 
                placeholder="Lagu, artis, atau username..." 
              />
            </form>

            <div className="mb-6">
              <input 
                type="text"
                placeholder="Cari Pengguna..."
                value={userSearchQuery}
                onChange={(e) => searchOtherUsers(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-xs px-4 py-2.5 rounded-xl text-white mb-2"
              />
              {userSearchResults.length > 0 && (
                <div className="space-y-2">
                  {userSearchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setViewedProfile(user); setActiveTab('profile'); }}>
                        <img src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-bold">{user.username}</p>
                          <p className="text-[10px] text-gray-400">{user.full_name}</p>
                        </div>
                      </div>
                      {user.id !== session?.user?.id && (
                        <button onClick={() => sendFriendRequest(user.id)} className="bg-zinc-800 hover:bg-zinc-700 text-xs px-3 py-1.5 rounded-lg font-medium">
                          Ikuti
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {searchHistory.length > 0 && !searchQuery && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Riwayat Pencarian</h3>
                <div className="space-y-1">
                  {searchHistory.slice(0, visibleHistoryCount).map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => { setSearchQuery(item); handleSearch({ preventDefault: () => {} } as any); }}
                      className="text-sm p-2 bg-zinc-900/50 rounded-lg hover:bg-zinc-800 cursor-pointer flex justify-between"
                    >
                      <span>{item}</span>
                      <span className="text-xs text-gray-500">Cari</span>
                    </div>
                  ))}
                </div>
                {visibleHistoryCount < searchHistory.length && (
                  <button onClick={() => setVisibleHistoryCount(prev => prev + 5)} className="text-xs text-gray-400 mt-2 hover:text-white">
                    Show More
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
               {isLoading ? (
                  <div className="text-center text-gray-400 mt-10">Mencari...</div>
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
                  Kembali ke Library
                </button>
                <div className="bg-gradient-to-b from-gray-800 to-black p-6 rounded-2xl mb-2">
                  <h2 className="text-2xl font-black mb-1">{activePlaylistView.title || activePlaylistView.name}</h2>
                  <p className="text-xs text-gray-400">{activePlaylistView.is_collaborative ? 'Collaborative Playlist' : 'Personal Playlist'}</p>
                  
                  {activePlaylistView.is_collaborative && playlistContributors.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-[11px] font-semibold text-gray-300 mb-1">Kontributor Playlist:</p>
                      <div className="flex flex-wrap gap-2">
                        {playlistContributors.map((c, i) => (
                          <span key={i} className="text-[10px] bg-white/10 px-2.5 py-1 rounded-full text-gray-200">
                            {c.name}: {c.percentage}% ({c.count} lagu)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {activePlaylistView.songs?.length > 0 ? (
                    activePlaylistView.songs.map((song: any, idx: number) => (
                      <div key={idx} onClick={() => playSong(song, activePlaylistView.songs, idx)} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden">
                            {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-semibold truncate">{song.title}</span>
                            <span className="text-xs text-gray-400 truncate">{song.artists?.map((a: any) => a.name).join(', ')} {song.addedByUsername ? `• Ditambahkan oleh ${song.addedByUsername}` : ''}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-10 text-sm">Playlist ini masih kosong. Tambahkan lagu dari menu titik tiga lagu.</p>
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
                        onClick={() => openPlaylistDetail(pl)}
                        className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center font-bold text-lg text-gray-400">
                            {pl.title?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{pl.title}</h4>
                            <p className="text-xs text-gray-400">{pl.is_collaborative ? 'Collaborative' : 'Personal'}</p>
                          </div>
                        </div>
                        <span className="text-gray-400">→</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 italic">Belum ada playlist kustom. Klik tombol Buat Playlist di atas.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && viewedProfile && (
          <div className="animate-fade-in -mx-4 -mt-2">
            <div className="relative h-44 w-full bg-zinc-800">
              <img src={viewedProfile.banner_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'} className="w-full h-full object-cover" />
            </div>

            <div className="px-6 pb-6 text-center -mt-16 relative">
              <div className="relative inline-block mx-auto">
                <img 
                  src={viewedProfile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'} 
                  className="w-28 h-28 rounded-full object-cover border-4 border-black"
                />
              </div>

              <div className="mt-3">
                <h2 className="text-xl font-bold">{viewedProfile.full_name || viewedProfile.username}</h2>
                <p className="text-xs text-zinc-400">@{viewedProfile.username}</p>
              </div>

              {viewedProfile.id === session?.user?.id && (
                <button 
                  onClick={() => setIsEditProfileOpen(true)}
                  className="mt-4 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium px-5 py-2 rounded-full transition border border-zinc-700"
                >
                  Edit Profil
                </button>
              )}

              <div className="grid grid-cols-4 gap-2 my-5">
                <div className="bg-zinc-900/80 border border-zinc-800 p-2.5 rounded-2xl text-center">
                  <p className="text-[10px] text-zinc-400">Liked</p>
                  <p className="text-sm font-bold">{likedSongsList.length}</p>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 p-2.5 rounded-2xl text-center">
                  <p className="text-[10px] text-zinc-400">Playlists</p>
                  <p className="text-sm font-bold">{playlists.length}</p>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 p-2.5 rounded-2xl text-center">
                  <p className="text-[10px] text-zinc-400">Followers</p>
                  <p className="text-sm font-bold">{totalFollowers}</p>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 p-2.5 rounded-2xl text-center">
                  <p className="text-[10px] text-zinc-400">Following</p>
                  <p className="text-sm font-bold">{totalFollowing}</p>
                </div>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl text-left space-y-3">
                <h3 className="text-xs font-semibold text-zinc-300">Pengaturan & Keamanan Akun</h3>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Enkripsi Sesi</span>
                  <span className="text-emerald-400 font-medium">AES-256 Active</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Cloud Database</span>
                  <span className="text-emerald-400 font-medium">Supabase Connected</span>
                </div>
              </div>

              {viewedProfile.id === session?.user?.id && (
                <button onClick={handleLogout} className="mt-6 w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2.5 rounded-xl text-xs font-semibold transition">
                  Keluar Akun (Logout)
                </button>
              )}
            </div>
          </div>
        )}

      </div>

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

      {isCreatePlaylistOpen && (
        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsCreatePlaylistOpen(false)}>
          <form onSubmit={handleCreatePlaylist} onClick={(e) => e.stopPropagation()} className="bg-[#1c1c1c] border border-white/10 w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-lg font-bold">Buat Playlist Baru</h3>
            <input 
              type="text" 
              placeholder="Nama playlist..." 
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 px-3 py-2.5 rounded-xl text-xs text-white focus:outline-none"
            />
            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={newPlaylistType} 
                onChange={(e) => setNewPlaylistType(e.target.checked)}
                className="rounded bg-zinc-800 border-zinc-700"
              />
              Jadikan Collaborative Playlist (Bersama Teman)
            </label>
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => setIsCreatePlaylistOpen(false)} className="flex-1 py-2.5 bg-zinc-800 text-gray-300 font-semibold rounded-xl text-xs">Batal</button>
              <button type="submit" className="flex-1 py-2.5 bg-white text-black font-bold rounded-xl text-xs">Buat</button>
            </div>
          </form>
        </div>
      )}

      {isAddToPlaylistOpen && (
        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsAddToPlaylistOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-[#1c1c1c] border border-white/10 w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-lg font-bold">Pilih atau Buat Playlist Baru</h3>

            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Nama playlist baru..." 
                value={inlinePlaylistName}
                onChange={(e) => setInlinePlaylistName(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
              />
              <button 
                onClick={handleCreateInlinePlaylistAndAdd}
                className="bg-white text-black font-bold px-3 py-2 rounded-xl text-xs"
              >
                Buat dan Tambah
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto mt-2">
              {playlists.length > 0 ? (
                playlists.map((pl) => (
                  <div key={pl.id} onClick={() => addSongToPlaylist(pl.id)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer flex justify-between items-center text-sm font-medium">
                    <span>{pl.title}</span>
                    <span className="text-xs text-gray-400">{pl.is_collaborative ? 'Collaborative' : 'Personal'}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">Belum ada playlist.</p>
              )}
            </div>
            <button onClick={() => setIsAddToPlaylistOpen(false)} className="w-full py-2.5 bg-[#2a2a2a] text-gray-300 font-semibold rounded-xl text-xs mt-2">Tutup</button>
          </div>
        </div>
      )}

      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsEditProfileOpen(false)}>
          <form onSubmit={handleUpdateProfile} onClick={(e) => e.stopPropagation()} className="bg-[#1c1c1c] border border-white/10 w-full max-w-sm rounded-2xl p-6 flex flex-col gap-3 shadow-2xl">
            <h3 className="text-lg font-bold mb-1">Edit Profil</h3>
            
            <input 
              type="text" 
              value={editFullName} 
              onChange={(e) => setEditFullName(e.target.value)} 
              placeholder="Nama Lengkap" 
              className="bg-zinc-800 border border-zinc-700 p-2.5 rounded-xl text-xs text-white"
            />
            <input 
              type="text" 
              value={editUsername} 
              onChange={(e) => setEditUsername(e.target.value)} 
              placeholder="Username" 
              className="bg-zinc-800 border border-zinc-700 p-2.5 rounded-xl text-xs text-white"
            />
            <input 
              type="text" 
              value={editAvatarUrl} 
              onChange={(e) => setEditAvatarUrl(e.target.value)} 
              placeholder="URL Foto Profil" 
              className="bg-zinc-800 border border-zinc-700 p-2.5 rounded-xl text-xs text-white"
            />
            <input 
              type="text" 
              value={editBannerUrl} 
              onChange={(e) => setEditBannerUrl(e.target.value)} 
              placeholder="URL Banner Sampul" 
              className="bg-zinc-800 border border-zinc-700 p-2.5 rounded-xl text-xs text-white"
            />

            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => setIsEditProfileOpen(false)} className="flex-1 py-2.5 bg-zinc-800 text-gray-300 font-semibold rounded-xl text-xs">Batal</button>
              <button type="submit" className="flex-1 py-2.5 bg-white text-black font-bold rounded-xl text-xs">Simpan</button>
            </div>
          </form>
        </div>
      )}

      <div className="fixed bottom-0 w-full h-[64px] bg-gradient-to-t from-black via-black/95 to-black/80 px-6 flex items-center justify-between z-40 pb-2">
        <div onClick={() => { setIsFullScreenTrendingOpen(false); setActiveTab('home'); }} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'home' && !isFullScreenTrendingOpen ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-6 h-6" fill={activeTab === 'home' ? "currentColor" : "none"} stroke="currentColor" strokeWidth={activeTab === 'home' ? "0" : "2"} viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span className="text-[10px] font-medium">Home</span>
        </div>

        <div onClick={() => { setIsFullScreenTrendingOpen(false); setActiveTab('search'); }} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'search' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={activeTab === 'search' ? "3" : "2"} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span className="text-[10px] font-medium">Search</span>
        </div>

        <div onClick={() => { setIsFullScreenTrendingOpen(false); setActiveTab('library'); }} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'library' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={activeTab === 'library' ? "3" : "2"} viewBox="0 0 24 24"><path d="M4 19V5a2 2 0 0 1 2-2h13.4a.5.5 0 0 1 .49.6l-1 5.2a.5.5 0 0 1-.49.4h-1.4"></path><path d="M4 19a2 2 0 0 0 2 2h14"></path><path d="M4 19h14"></path><path d="M8 12h8"></path><path d="M8 16h6"></path></svg>
          <span className="text-[10px] font-medium">Library</span>
        </div>

        <div onClick={() => { setIsFullScreenTrendingOpen(false); setViewedProfile(profile); setActiveTab('profile'); }} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'profile' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          <span className="text-[10px] font-medium">Profile</span>
        </div>
      </div>

    </div>
  );
            }
