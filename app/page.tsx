'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../lib/supabase'; // Poin 7: Menggunakan lib/supabase.ts milikmu

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

export default function Page() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showOptions, setShowOptions] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [favorites, setFavorites] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({ 
    username: 'Musify User', 
    avatar: '', 
    cover: '',
    bio: 'Music Enthusiast'
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const playerRef = useRef<any>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Poin 1 & 7: Load Profile & Data dari LocalStorage + Supabase DB saat Reload
  useEffect(() => {
    const loadInitialData = async () => {
      // Load Local Storage dulu agar instan pas reload
      const localProfile = localStorage.getItem('user_profile');
      if (localProfile) setProfile(JSON.parse(localProfile));

      const savedFavs = localStorage.getItem('favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedHistory = localStorage.getItem('search_history');
      if (savedHistory) setSearchHistory(JSON.parse(savedHistory));

      // Fetch Session & Database Supabase
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          
          // Pull profile dari table 'profiles' Supabase
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (data && !error) {
            const fetchedProfile = {
              username: data.username || 'Musify User',
              avatar: data.avatar_url || '',
              cover: data.cover_url || '',
              bio: data.bio || 'Music Enthusiast'
            };
            setProfile(fetchedProfile);
            localStorage.setItem('user_profile', JSON.stringify(fetchedProfile));
          }
        }
      } catch (err) {
        console.log('Syncing database info...', err);
      }
    };

    loadInitialData();
  }, []);

  // Poin 1: Handle Upload Gambar & Cover ke Storage Supabase
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsSavingProfile(true);
      let publicUrl = '';

      // Upload file ke Storage Supabase bucket 'profiles'
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${Date.now()}.${fileExt}`;
      const filePath = `${user?.id || 'guest'}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('profiles').getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      } else {
        // Fallback jika bucket storage belum disetting permission-nya
        publicUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      const updatedProfile = { ...profile, [type]: publicUrl };
      setProfile(updatedProfile);
      localStorage.setItem('user_profile', JSON.stringify(updatedProfile));

      // Simpan ke database Supabase jika logged in
      if (user?.id) {
        await supabase.from('profiles').upsert({
          id: user.id,
          username: updatedProfile.username,
          avatar_url: updatedProfile.avatar,
          cover_url: updatedProfile.cover,
          bio: updatedProfile.bio,
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const saveProfileToDB = async () => {
    setIsSavingProfile(true);
    localStorage.setItem('user_profile', JSON.stringify(profile));
    
    if (user?.id) {
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          username: profile.username,
          avatar_url: profile.avatar,
          cover_url: profile.cover,
          bio: profile.bio,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.error(e);
      }
    }
    setTimeout(() => {
      setIsSavingProfile(false);
      alert('Profil berhasil tersimpan di Database!');
    }, 500);
  };

  // Poin 8: Search History Text Handling
  const handleSearch = async (queryToSearch?: string) => {
    const query = queryToSearch !== undefined ? queryToSearch : searchQuery;
    if (!query.trim()) return;

    setSearchQuery(query);
    setIsSearching(true);

    // Save Search History (Hanya Teks Kata Kunci Pencarian)
    const filteredHistory = searchHistory.filter(q => q.toLowerCase() !== query.toLowerCase());
    const newHistory = [query, ...filteredHistory].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));

    try {
      const res = await fetch(`https://invidious.jing.rocks/api/v1/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.filter((item: any) => item.type === 'video'));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const removeSearchHistory = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    const updated = searchHistory.filter(item => item !== text);
    setSearchHistory(updated);
    localStorage.setItem('search_history', JSON.stringify(updated));
  };

  const playTrack = (track: any) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setIsFullScreen(true);
  };

  const toggleFavorite = (track: any) => {
    const exists = favorites.find((f) => f.videoId === track.videoId);
    let newFavs;
    if (exists) {
      newFavs = favorites.filter((f) => f.videoId !== track.videoId);
    } else {
      newFavs = [...favorites, track];
    }
    setFavorites(newFavs);
    localStorage.setItem('favorites', JSON.stringify(newFavs));
  };

  const isTrackFavorite = (videoId: string) => favorites.some((f) => f.videoId === videoId);

  // Mock sample data UI lama
  const mockVibes = [
    { videoId: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up (Official Music Video)', author: 'Rick Astley', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
    { videoId: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito ft. Daddy Yankee', author: 'Luis Fonsi', thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg' },
    { videoId: 'fHI8X4OXluQ', title: 'The Weeknd - Blinding Lights (Official Audio)', author: 'The Weeknd', thumbnail: 'https://i.ytimg.com/vi/fHI8X4OXluQ/hqdefault.jpg' },
    { videoId: '3JZ_D3ELwOQ', title: 'Lofi Hip Hop Radio - Beats to Relax/Study to', author: 'Lofi Girl', thumbnail: 'https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg' }
  ];

  return (
    <div className="bg-black min-h-screen text-white font-sans overflow-hidden flex flex-col relative">
      
      {/* HEADER UTAMA */}
      <div className="flex justify-between items-center px-4 pt-4 pb-2 z-10">
        <h1 className="text-xl font-bold tracking-wider text-white">MUSIFY</h1>
        <div 
          className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden cursor-pointer flex items-center justify-center" 
          onClick={() => setActiveTab('profile')}
        >
          {profile.avatar ? (
            <img src={profile.avatar} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-gray-300">{profile.username[0]}</span>
          )}
        </div>
      </div>

      {/* AREA KONTEN (TABS) */}
      <div className="flex-1 overflow-y-auto pb-32">
        
        {/* HOMEPAGE TAB */}
        {activeTab === 'home' && (
          <div className="px-4 pt-2">
            <h2 className="text-2xl font-extrabold mb-4 tracking-tight">Good Evening</h2>
            
            {/* Quick Grid Cards (UI lama) */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {mockVibes.slice(0, 4).map((track, i) => (
                <div 
                  key={i} 
                  onClick={() => playTrack(track)} 
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-lg flex items-center gap-3 overflow-hidden cursor-pointer hover:bg-zinc-800 transition group"
                >
                  <img src={track.thumbnail} className="w-14 h-14 object-cover" />
                  {/* Poin 4: Judul dipotong truncate */}
                  <p className="text-xs font-semibold truncate pr-2 group-hover:text-green-400 transition">{track.title}</p>
                </div>
              ))}
            </div>

            {/* Vibes for You Section */}
            <h3 className="text-lg font-bold mb-3 tracking-wide">Vibes for You</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {mockVibes.map((track, i) => (
                <div 
                  key={i} 
                  className="min-w-[140px] max-w-[140px] cursor-pointer group" 
                  onClick={() => playTrack(track)}
                >
                  <div className="relative w-[140px] h-[140px] mb-2 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                    <img src={getHighResCover(track.thumbnail)} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                  {/* Poin 4: Title dipotong rapi dengan truncate ... */}
                  <h4 className="text-sm font-semibold truncate w-full text-zinc-100 group-hover:text-green-400 transition">{track.title}</h4>
                  <p className="text-xs text-zinc-400 truncate w-full mt-0.5">{track.author}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEARCH TAB */}
        {activeTab === 'search' && (
          <div className="px-4 pt-2">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="mb-6 relative">
              <input
                type="text"
                placeholder="What do you want to listen to?"
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-zinc-500 text-sm placeholder:text-zinc-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="w-5 h-5 absolute left-4 top-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>

            {/* Poin 8: Murni Search History (Riwayat Kata Kunci Pencarian) */}
            {searchQuery.length === 0 && searchResults.length === 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-base text-zinc-200">Search History</h3>
                  {searchHistory.length > 0 && (
                    <button 
                      onClick={() => { setSearchHistory([]); localStorage.removeItem('search_history'); }}
                      className="text-xs text-zinc-500 hover:text-zinc-300"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {searchHistory.length > 0 ? (
                  <div className="flex flex-col gap-1.5 mb-8">
                    {searchHistory.map((historyText, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => handleSearch(historyText)} 
                        className="flex items-center justify-between p-2.5 bg-zinc-900/50 border border-zinc-800/40 rounded-xl cursor-pointer hover:bg-zinc-800/80 transition"
                      >
                        <div className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium text-zinc-300">{historyText}</span>
                        </div>
                        <button 
                          onClick={(e) => removeSearchHistory(e, historyText)}
                          className="text-zinc-500 hover:text-zinc-300 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 mb-8">Belum ada riwayat pencarian.</p>
                )}

                {/* Suggested for You berdasarkan Vibes/Genre Popular */}
                <h3 className="font-bold text-base text-zinc-200 mb-3">Suggested for You</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['Pop Indonesian', 'Acoustic Chill', 'Lofi Study Beats', 'Synthwave 80s', 'Indie Rock', 'K-Pop Hits'].map((genre) => (
                    <div 
                      key={genre} 
                      onClick={() => handleSearch(genre)} 
                      className="bg-zinc-900 border border-zinc-800/80 p-3.5 rounded-xl text-xs font-semibold text-zinc-300 cursor-pointer hover:bg-zinc-800 hover:text-white transition flex items-center justify-between"
                    >
                      <span>{genre}</span>
                      <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hasil Search */}
            {isSearching ? (
              <div className="flex justify-center mt-12">
                <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-white"></div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {searchResults.map((track) => (
                  <div 
                    key={track.videoId} 
                    onClick={() => playTrack(track)} 
                    className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/50 p-2 rounded-xl cursor-pointer hover:bg-zinc-800 transition"
                  >
                    <img src={track.videoThumbnails?.[0]?.url || track.thumbnail} className="w-14 h-14 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      {/* Poin 4: Title dipotong truncate */}
                      <h4 className="text-sm font-semibold truncate text-zinc-100">{track.title}</h4>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">{track.author}</p>
                    </div>
                    {/* Poin 2: Tidak ada love di luar list, hanya titik tiga untuk menu */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowOptions(track); }} 
                      className="p-2 text-zinc-400 hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LIBRARY TAB */}
        {activeTab === 'library' && (
          <div className="px-4 pt-2">
            <h2 className="text-2xl font-bold mb-6">Your Library</h2>
            <div className="flex flex-col gap-3">
              {favorites.length === 0 ? (
                <div className="text-center mt-12 text-zinc-500 text-sm">
                  <p>Belum ada lagu favorit tersimpan.</p>
                </div>
              ) : (
                favorites.map((track) => (
                  <div 
                    key={track.videoId} 
                    onClick={() => playTrack(track)} 
                    className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800/50 p-2 rounded-xl cursor-pointer hover:bg-zinc-800 transition"
                  >
                    <img src={track.videoThumbnails?.[0]?.url || track.thumbnail} className="w-14 h-14 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold truncate text-zinc-100">{track.title}</h4>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">{track.author}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(track); }} 
                      className="p-2 text-green-500"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Poin 6: PROFILE TAB (Hirarki Kotakan Baru) */}
        {activeTab === 'profile' && (
          <div className="px-4 pt-2">
            <h2 className="text-2xl font-bold mb-4">Profile</h2>

            {/* KOTAKAN UTAMA PROFILE (Dari Atas Cover Sampai Bagian Followers) */}
            <div className="bg-zinc-900/90 rounded-2xl overflow-hidden border border-zinc-800/80 shadow-xl">
              
              {/* Cover Image */}
              <div 
                className="h-32 bg-zinc-800 relative cursor-pointer group overflow-hidden" 
                onClick={() => coverInputRef.current?.click()}
              >
                {profile.cover ? (
                  <img src={profile.cover} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                    Tap to select cover image/gif
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-xs bg-black/60 px-3 py-1 rounded-full border border-white/20">Change Cover</span>
                </div>
              </div>

              {/* User Info Section */}
              <div className="px-4 pb-4 relative">
                {/* Avatar Circle */}
                <div 
                  className="w-20 h-20 rounded-full border-4 border-zinc-900 bg-zinc-800 absolute -top-10 cursor-pointer overflow-hidden group shadow-lg"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {profile.avatar ? (
                    <img src={profile.avatar} className="w-full h-full object-cover group-hover:scale-110 transition" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-zinc-400">
                      {profile.username[0]}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:opacity-100 opacity-0 transition flex items-center justify-center text-[10px]">
                    Edit
                  </div>
                </div>

                {/* Name & Save Button */}
                <div className="mt-12 flex justify-between items-end mb-4">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="text" 
                        value={profile.username} 
                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                        className="text-lg font-bold bg-transparent border-b border-transparent focus:border-zinc-500 focus:outline-none max-w-[170px]"
                      />
                      
                      {/* Poin 3: SVG Centang Biru (Verified Badge) */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 min-w-[16px]">
                        <path d="M22.5 12.5l-1.58 1.58 .36 2.22-2.19.46-1.12 1.95-2.14-.92-2.02.92-1.12-1.95-2.19-.46.36-2.22L2.5 12.5l1.58-1.58-.36-2.22 2.19-.46 1.12-1.95 2.14.92 2.02-.92 1.12 1.95 2.19.46-.36 2.22 1.58 1.58z" fill="#1DA1F2" />
                        <path d="M10.5 16.5l-3-3 1.41-1.41 1.59 1.59 4.59-4.59 1.41 1.41-6 6z" fill="#FFFFFF" />
                      </svg>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{user?.email || 'user@musify.app'}</p>
                  </div>

                  <button 
                    onClick={saveProfileToDB} 
                    disabled={isSavingProfile}
                    className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-zinc-200 transition disabled:opacity-50"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>

                {/* KOTAKAN FOLLOWERS DLL (Berada di DALAM Kotakan Utama Profile) */}
                <div className="bg-zinc-800/60 rounded-xl p-3 flex justify-around text-center border border-zinc-700/50 mt-2">
                  <div>
                    <p className="text-[10px] text-zinc-400 mb-0.5 uppercase tracking-wider font-medium">Followers</p>
                    <p className="font-bold text-sm text-zinc-100">1.2K</p>
                  </div>
                  <div className="w-px bg-zinc-700/60"></div>
                  <div>
                    <p className="text-[10px] text-zinc-400 mb-0.5 uppercase tracking-wider font-medium">Following</p>
                    <p className="font-bold text-sm text-zinc-100">284</p>
                  </div>
                  <div className="w-px bg-zinc-700/60"></div>
                  <div>
                    <p className="text-[10px] text-zinc-400 mb-0.5 uppercase tracking-wider font-medium">Favorites</p>
                    <p className="font-bold text-sm text-zinc-100">{favorites.length}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Poin 6: KOTAKAN CLOUD DATABASE (Berada terpisah di BAWAH Kotakan Profile) */}
            <div className="bg-zinc-900/90 rounded-2xl p-4 mt-4 border border-zinc-800/80 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-300">Cloud Database Status</h3>
                </div>
                <span className="text-[10px] bg-green-950 text-green-400 px-2 py-0.5 rounded-full border border-green-800/50 font-medium">
                  Connected
                </span>
              </div>
              
              <p className="text-xs text-zinc-400 mb-3">
                Profile dan media kamu tersimpan secara sinkron di Supabase Storage & Database.
              </p>

              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full w-[85%]"></div>
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-zinc-500 font-medium">
                <span>Database: Supabase PostgreSQL</span>
                <span>Storage: Active</span>
              </div>
            </div>

            {/* Input Tersembunyi untuk Pilih Gambar & Gif */}
            <input type="file" ref={avatarInputRef} className="hidden" accept="image/*,image/gif" onChange={(e) => handleFileUpload(e, 'avatar')} />
            <input type="file" ref={coverInputRef} className="hidden" accept="image/*,image/gif" onChange={(e) => handleFileUpload(e, 'cover')} />
          </div>
        )}

      </div>

      {/* MINI PLAYER FLOATING */}
      {currentTrack && !isFullScreen && (
        <div 
          onClick={() => setIsFullScreen(true)}
          className="absolute bottom-[68px] left-3 right-3 bg-zinc-900/95 backdrop-blur-md rounded-2xl p-2 flex items-center gap-3 cursor-pointer shadow-2xl border border-zinc-800/80 z-40"
        >
          <img src={currentTrack.videoThumbnails?.[0]?.url || currentTrack.thumbnail} className="w-11 h-11 rounded-xl object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate text-white">{currentTrack.title}</p>
            <p className="text-[11px] text-zinc-400 truncate mt-0.5">{currentTrack.author}</p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} 
            className="p-2 text-white hover:scale-105 transition"
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
        </div>
      )}

      {/* BOTTOM NAVIGATION */}
      <div className="absolute bottom-0 w-full bg-black/90 backdrop-blur-xl border-t border-zinc-900 flex justify-around items-center py-2.5 z-40">
        {[
          { id: 'home', label: 'Home', icon: <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /> },
          { id: 'search', label: 'Search', icon: <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /> },
          { id: 'library', label: 'Library', icon: <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z" /> },
        ].map((tab) => (
          <div 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              {tab.icon}
            </svg>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </div>
        ))}
      </div>

      {/* MODAL OPTIONS (TITIK TIGA) */}
      {showOptions && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end" onClick={() => setShowOptions(null)}>
          <div className="w-full bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
              <img src={showOptions.thumbnail || showOptions.videoThumbnails?.[0]?.url} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold truncate">{showOptions.title}</h4>
                <p className="text-xs text-zinc-400 truncate">{showOptions.author}</p>
              </div>
            </div>

            {/* Poin 2: Love / Favorite dapat diakses dari Titik Tiga */}
            <button 
              onClick={() => { toggleFavorite(showOptions); setShowOptions(null); }}
              className="flex items-center gap-3 text-sm font-medium py-2 text-zinc-200 hover:text-white"
            >
              <svg className={`w-5 h-5 ${isTrackFavorite(showOptions.videoId) ? 'text-green-500 fill-current' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{isTrackFavorite(showOptions.videoId) ? 'Remove from Favorites' : 'Add to Favorites'}</span>
            </button>

            <button onClick={() => setShowOptions(null)} className="w-full bg-zinc-800 py-3 rounded-xl text-sm font-semibold mt-2">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Poin 5: FULL SCREEN PLAYER */}
      <div className={`fixed inset-0 z-50 bg-black transition-transform duration-500 ${isFullScreen ? 'translate-y-0' : 'translate-y-full'} flex flex-col`}>
        
        {/* Background Image diperkecil & Fade Gradasi Menyatu Hitam */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Poin 5: Ukuran background diperkecil (h-[48%] & scale-90) */}
          <div
             className="absolute top-2 left-0 right-0 h-[48%] bg-cover bg-center opacity-30 blur-xl scale-90 transition-all duration-700"
             style={{ backgroundImage: `url(${getHighResCover(currentTrack?.thumbnail || currentTrack?.videoThumbnails?.[0]?.url)})` }}
          />
          {/* Poin 5: Fade gradasi ke hitam bawah dipertahankan */}
          <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-transparent via-black/70 to-black" />
          <div className="absolute top-[60%] left-0 w-full h-[40%] bg-black" />
        </div>

        {/* Player Content */}
        <div className="relative z-10 flex flex-col h-full px-6 pt-10 pb-8 justify-between">
          
          {/* Header Player */}
          <div className="flex justify-between items-center">
            <button onClick={() => setIsFullScreen(false)} className="p-2 -ml-2 text-zinc-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">Playing from Search</span>
            <button onClick={() => setShowOptions(currentTrack)} className="p-2 -mr-2 text-zinc-400 hover:text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>

          {/* Main Artwork Cover */}
          <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-black my-auto relative bg-zinc-900 border border-zinc-800/80">
            {currentTrack && (
              <img 
                src={getHighResCover(currentTrack.videoThumbnails?.[0]?.url || currentTrack.thumbnail)} 
                className="w-full h-full object-cover" 
                alt="cover"
              />
            )}
          </div>

          {/* Track Info & Poin 2: Love Icon ada di Full Screen */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1 min-w-0 pr-4">
                <h2 className="text-xl font-bold truncate text-white mb-1">{currentTrack?.title}</h2>
                <p className="text-zinc-400 text-sm truncate">{currentTrack?.author}</p>
              </div>
              <button onClick={() => toggleFavorite(currentTrack)} className="p-2 text-white">
                {currentTrack && isTrackFavorite(currentTrack.videoId) ? (
                  <svg className="w-7 h-7 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Seekbar Progress */}
            <div className="mb-6">
              <div 
                className="w-full bg-zinc-800 h-1.5 rounded-full mb-2 cursor-pointer relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const newProgress = (e.clientX - rect.left) / rect.width;
                  if (playerRef.current) playerRef.current.seekTo(newProgress);
                }}
              >
                <div 
                  className="bg-white h-1.5 rounded-full relative" 
                  style={{ width: `${(progress / duration) * 100 || 0}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md" />
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-400 font-medium">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex justify-between items-center px-2">
              <button className="text-zinc-500 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" /></svg>
              </button>
              <button className="text-white hover:scale-110 transition">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-14 h-14 bg-white text-black rounded-full flex justify-center items-center hover:scale-105 transition"
              >
                {isPlaying ? (
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                ) : (
                  <svg className="w-7 h-7 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
              <button className="text-white hover:scale-110 transition">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
              </button>
              <button className="text-zinc-500 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" /></svg>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* REACT PLAYER HIDDEN */}
      {currentTrack && (
        <div className="hidden">
          <ReactPlayer
            ref={playerRef}
            url={`https://www.youtube.com/watch?v=${currentTrack.videoId}`}
            playing={isPlaying}
            onProgress={(p) => setProgress(p.playedSeconds)}
            onDuration={setDuration}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      )}

    </div>
  );
}
