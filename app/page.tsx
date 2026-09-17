'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ReactPlayer = dynamic(() => import('react-player/youtube'), { ssr: false });

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return '0:00';
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
  const [activeTab, setActiveTab] = useState('home'); 
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [randomSongs, setRandomSongs] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [visibleHistoryCount, setVisibleHistoryCount] = useState(5);

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

  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);
  
  // Ref untuk auto scroll lirik di kotak 1:1 saja tanpa menggeser layar utama
  const lyricContainerRef = useRef<HTMLDivElement>(null);
  const activeLyricRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('icarus_history') || '[]');
    setHistory(savedHistory);
    loadHomepageData(savedHistory);
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (currentTrack) {
      setLyrics(null);
      setIsLoadingLyrics(true);
      
      const fetchLyrics = async () => {
        try {
          const artist = currentTrack.artists?.[0]?.name || '';
          const title = currentTrack.title?.replace(/\s*\(.*?\)\s*/g, '').replace(/\s*\[.*?\]\s*/g, '').split(' - ')[0] || '';
          
          const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
          if (!res.ok) throw new Error('Not found');
          
          const data = await res.json();
          setLyrics(data.lyrics);
        } catch (error) {
          setLyrics("Maaf, lirik tidak tersedia untuk lagu ini.");
        } finally {
          setIsLoadingLyrics(false);
        }
      };
      
      fetchLyrics();
    }
  }, [currentTrack?.videoId]);

  const lyricLines = lyrics ? lyrics.split('\n').filter(line => line.trim() !== '') : [];
  const activeLineIndex = duration > 0 ? Math.min(Math.floor((playedSeconds / duration) * lyricLines.length), lyricLines.length - 1) : 0;

  // Auto scroll khusus di dalam kotak lirik 1:1 (tidak menggeser layar utama)
  useEffect(() => {
    if (!isLyricsExpanded && activeLyricRef.current && lyricContainerRef.current) {
      activeLyricRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }
  }, [activeLineIndex, isLyricsExpanded]);

  const loadHomepageData = async (userHistory: any[]) => {
    setIsLoading(true);
    try {
      const res1 = await fetch(`/api/search?q=Global Viral Hits 2026`);
      const json1 = await res1.json();
      if (json1.status === 'success') {
        setSuggestions(json1.data.slice(0, 15)); 
      }

      const res2 = await fetch(`/api/search?q=Trending Chill Mix`);
      const json2 = await res2.json();
      if (json2.status === 'success') {
        setRandomSongs(json2.data.slice(0, 15));
      }
    } catch (error) {
      console.error("Gagal memuat homepage", error);
    }
    setIsLoading(false);
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
    localStorage.setItem('icarus_history', JSON.stringify(newHistory));
  };

  const handleNext = () => {
    if (isRepeat === 'one' && currentTrack) {
      if (playerRef.current) playerRef.current.seekTo(0, 'seconds');
      return;
    }
    if (currentQueue.length > 0) {
      let nextIdx;
      if (isShuffle) {
        nextIdx = Math.floor(Math.random() * currentQueue.length);
      } else {
        nextIdx = (currentIndex + 1) % currentQueue.length;
      }
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

  // [KOREKSI 6] Progress Bar Crucial Fix (Cegah mental kembali)
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const clampedPosition = Math.max(0, Math.min(1, clickPosition));
    
    setPlayedProgress(clampedPosition);
    if (duration > 0) {
      const targetSeconds = clampedPosition * duration;
      setPlayedSeconds(targetSeconds);
      if (playerRef.current) {
        playerRef.current.seekTo(targetSeconds, 'seconds');
      }
    }
  };

  const handleShare = () => {
    const songUrl = `https://www.youtube.com/watch?v=${currentTrack?.videoId}`;
    if (navigator.share) {
      navigator.share({
        title: currentTrack?.title,
        text: `Dengarkan ${currentTrack?.title} di Icarus Music`,
        url: songUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(songUrl);
      setToastMessage("Tautan lagu disalin!");
    }
    setIsMenuOpen(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${searchQuery}`);
      const json = await res.json();
      if (json.status === 'success') setSearchResults(json.data);
    } catch (error) {
      console.error("Gagal mencari", error);
    }
    setIsLoading(false);
  };

  const suggestionColumns = chunkArray(suggestions, 5);
  const historyColumns = chunkArray(history, 5);

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-gray-700">
      
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-white text-black font-semibold px-4 py-2 rounded-full shadow-2xl z-[100] text-xs animate-bounce">
          {toastMessage}
        </div>
      )}

      {currentTrack && (
        <div className="hidden">
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
              setPlayedProgress(played);
              setPlayedSeconds(playedSeconds);
            }}
            onDuration={(dur) => setDuration(dur)}
            onEnded={handleNext}
            volume={1}
            width="0"
            height="0"
          />
        </div>
      )}

      {activeTab === 'home' && (
        <div className="sticky top-0 bg-black/90 backdrop-blur-md z-40 px-4 py-4 flex gap-3 items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-600 to-gray-400 flex items-center justify-center text-xs font-bold shadow-md">
            ME
          </div>
          <button className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-semibold transition hover:scale-105">
            All
          </button>
          <button className="bg-[#242424] text-white px-4 py-1.5 rounded-full text-sm font-semibold transition hover:bg-[#303030]">
            Music
          </button>
          <button className="bg-[#242424] text-white px-4 py-1.5 rounded-full text-sm font-semibold transition hover:bg-[#303030]">
            Podcasts
          </button>
        </div>
      )}

      <div className="pb-32 px-4 pt-2 overflow-y-auto">
        {activeTab === 'home' && (
          <div className="flex flex-col gap-8 animate-fade-in">
            
            {/* SECTION 1: START LISTENING (CAROUSEL DENGAN PEEK DI KANAN DAN TRUNCATE NAMA) */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Jump into a session based on your tastes</p>
                  <h2 className="text-2xl font-bold tracking-tight">Start listening</h2>
                </div>
                {/* [KOREKSI 3] SEE ALL KE TAB SEARCH */}
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
                    <div key={colIdx} className="flex flex-col gap-1 min-w-[270px] max-w-[280px] flex-shrink-0 snap-start">
                      {column.map((song: any, songIdx: number) => {
                        const globalIdx = colIdx * 5 + songIdx;
                        const artistName = song.artists?.map((a: any) => a.name).join(', ') || '';
                        return (
                          <div 
                            key={songIdx} 
                            onClick={() => playSong(song, suggestions, globalIdx)} 
                            className="flex items-center justify-between py-2 px-1 rounded-md hover:bg-[#1a1a1a] cursor-pointer group transition-colors"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-12 h-12 bg-gray-800 rounded flex-shrink-0 overflow-hidden relative">
                                 {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
                                 {currentTrack?.videoId === song.videoId && isPlaying && (
                                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                     <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                                   </div>
                                 )}
                              </div>
                              {/* [KOREKSI 2] Truncate nama lagu & artis */}
                              <div className="flex flex-col overflow-hidden pr-2">
                                <span className={`text-base font-medium truncate w-40 sm:w-48 ${currentTrack?.videoId === song.videoId ? 'text-green-400 font-bold' : 'text-white'}`}>
                                  {song.title}
                                </span>
                                <span className="text-sm text-gray-400 truncate w-40 sm:w-48">
                                  {artistName}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center text-gray-400 px-1">
                               <svg className="w-5 h-5 hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* SECTION 2: RECENTLY PLAYED (CAROUSEL HORIZONTAL) */}
            {history.length > 0 && (
              <section className="mt-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold tracking-tight">Recently Played</h2>
                </div>
                <div className="flex overflow-x-auto gap-4 pb-2 snap-x scrollbar-none pr-12">
                  {historyColumns.map((column, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-1 min-w-[270px] max-w-[280px] flex-shrink-0 snap-start">
                      {column.map((song: any, songIdx: number) => {
                        const globalIdx = colIdx * 5 + songIdx;
                        const artistName = song.artists?.map((a: any) => a.name).join(', ') || '';
                        return (
                          <div 
                            key={songIdx} 
                            onClick={() => playSong(song, history, globalIdx)} 
                            className="flex items-center justify-between py-2 px-1 rounded-md hover:bg-[#1a1a1a] cursor-pointer group transition-colors"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-12 h-12 bg-gray-800 rounded flex-shrink-0 overflow-hidden relative">
                                 {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
                              </div>
                              <div className="flex flex-col overflow-hidden pr-2">
                                <span className="text-base font-medium text-white truncate w-40 sm:w-48">{song.title}</span>
                                <span className="text-sm text-gray-400 truncate w-40 sm:w-48">
                                  {artistName}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 px-1">
                               <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                                 <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
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

            {/* SECTION 3: DAFTAR LAGU RANDOM (LIST BIASA VERTIKAL DENGAN SHOW MORE) */}
            {randomSongs.length > 0 && (
              <section className="mt-2">
                <h2 className="text-xl font-bold tracking-tight mb-4">Recommended For You</h2>
                <div className="flex flex-col gap-1">
                  {randomSongs.slice(0, visibleHistoryCount).map((song, idx) => (
                    <div key={idx} onClick={() => playSong(song, randomSongs, idx)} className="flex items-center justify-between py-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer group transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-12 h-12 bg-gray-800 rounded flex-shrink-0 overflow-hidden">
                           {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-base font-medium text-white truncate">{song.title}</span>
                          <span className="text-sm text-gray-400 truncate">
                            {song.artists?.map((a: any) => a.name).join(', ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-gray-400 px-2">
                         <svg className="w-5 h-5 hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                      </div>
                    </div>
                  ))}
                </div>

                {visibleHistoryCount < randomSongs.length && (
                  <div className="mt-4 text-center">
                    <button 
                      onClick={() => setVisibleHistoryCount(prev => Math.min(prev + 5, randomSongs.length))}
                      className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white py-2 px-6 bg-[#222] hover:bg-[#333] rounded-full transition-colors shadow"
                    >
                      Show more
                    </button>
                  </div>
                )}
              </section>
            )}

          </div>
        )}

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
                   <div key={idx} onClick={() => playSong(song, searchResults, idx)} className="flex items-center justify-between py-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer group transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-14 h-14 bg-gray-800 flex-shrink-0 overflow-hidden">
                           {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-base font-semibold text-white truncate">{song.title}</span>
                          <span className="text-sm text-gray-400 truncate">
                            Track • {song.artists?.map((a: any) => a.name).join(', ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center px-2 text-gray-400">
                         <svg className="w-5 h-5 hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                      </div>
                   </div>
                 ))
               ) : (
                  <div className="text-center text-gray-500 mt-10">Search your favorite track or artist</div>
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
          
          <div className="flex items-center gap-4 px-2 text-white">
            <svg className="w-5 h-5 hidden sm:block hover:text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v12H4V6zm2 2v8h12V8H6z"/></svg>
            <svg className="w-5 h-5 hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
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
                  <img 
                    src={getHighResCover(currentTrack.thumbnails[currentTrack.thumbnails.length - 1].url)} 
                    alt="cover" 
                    className="w-full h-full object-cover" 
                  />
                )}
              </div>

              <div className="w-full flex justify-between items-center mb-8">
                <div className="overflow-hidden mr-4">
                  <h2 className="text-2xl font-bold truncate text-white mb-1">{currentTrack.title}</h2>
                  <p className="text-gray-400 text-lg truncate">
                    {currentTrack.artists?.map((a: any) => a.name).join(', ')}
                  </p>
                </div>
                <button>
                  <svg className="w-7 h-7 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                </button>
              </div>

              <div className="w-full mb-6">
                <div 
                  onClick={handleSeek} 
                  className="h-[6px] bg-gray-600 rounded-full w-full relative group cursor-pointer"
                >
                  <div className="h-full bg-white rounded-full absolute top-0 left-0 pointer-events-none" style={{ width: `${playedProgress * 100}%` }}></div>
                  <div 
                     className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none" 
                     style={{ left: `calc(${playedProgress * 100}% - 7px)` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-gray-400 mt-2">
                  <span>{formatTime(playedSeconds)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="w-full flex items-center justify-between mb-10 px-2">
                <button 
                  onClick={() => setIsShuffle(!isShuffle)} 
                  className={`transition-colors ${isShuffle ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`}
                  title="Shuffle"
                >
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                </button>
                
                <button onClick={handlePrev} className="text-white hover:text-gray-300 transition-colors">
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

                <button onClick={handleNext} className="text-white hover:text-gray-300 transition-colors">
                   <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                </button>

                <button 
                  onClick={() => setIsRepeat(isRepeat === 'off' ? 'all' : isRepeat === 'all' ? 'one' : 'off')} 
                  className={`relative transition-colors ${isRepeat !== 'off' ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`}
                  title={`Repeat: ${isRepeat}`}
                >
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                   {isRepeat === 'one' && (
                     <span className="absolute -top-1 -right-1 text-[9px] bg-white text-black font-extrabold rounded-full w-3.5 h-3.5 flex items-center justify-center">1</span>
                   )}
                </button>
              </div>
            </div>

            {/* LYRICS SECTION ([KOREKSI 1] AUTO SCROLL KHUSUS DI DALAM KOTAK LIRIK, TANPA GESER LAYAR UTAMA) */}
            <div className="px-6 mt-4 pb-12">
              <div className={`bg-[#181818] rounded-xl p-6 shadow-2xl transition-all duration-300 ${isLyricsExpanded ? 'fixed inset-4 z-50 bg-[#121212] overflow-y-auto max-h-none flex flex-col' : 'min-h-[320px] max-h-[380px] overflow-hidden relative'}`}>
                
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-inherit pt-1 pb-3 border-b border-white/10 z-10">
                  <h3 className="text-sm font-bold tracking-wide">Lyrics</h3>
                  <button 
                    onClick={() => setIsLyricsExpanded(!isLyricsExpanded)}
                    className="bg-black/60 p-2 rounded-full hover:bg-black transition-colors"
                  >
                    {isLyricsExpanded ? (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                    )}
                  </button>
                </div>
                
                <div ref={lyricContainerRef} className={`flex flex-col gap-4 text-xl font-bold overflow-y-auto ${isLyricsExpanded ? 'flex-1 py-4 text-2xl md:text-3xl' : 'max-h-[260px] pr-2'}`}>
                  {isLoadingLyrics ? (
                    <div className="flex flex-col gap-4 animate-pulse pt-10">
                      <div className="h-5 bg-gray-800 rounded w-3/4"></div>
                      <div className="h-5 bg-gray-800 rounded w-1/2"></div>
                      <div className="h-5 bg-gray-800 rounded w-5/6"></div>
                      <div className="h-5 bg-gray-800 rounded w-2/3 mt-4"></div>
                    </div>
                  ) : lyricLines.length > 0 ? (
                    lyricLines.map((line, idx) => {
                      const isActive = idx === activeLineIndex;
                      return (
                        <div 
                          key={idx}
                          ref={isActive ? activeLyricRef : null}
                          className={`transition-all duration-300 leading-relaxed ${
                            isActive 
                              ? 'text-white text-2xl md:text-3xl font-extrabold scale-[1.02] origin-left drop-shadow-lg' 
                              : 'text-gray-500 text-lg md:text-xl font-medium opacity-60'
                          }`}
                        >
                          {line}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 font-normal italic text-base pt-10 text-center">
                      Lirik lagu tidak ditemukan di database publik.
                    </p>
                  )}
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
                {currentTrack?.thumbnails?.[0]?.url && <img src={currentTrack.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-white text-base truncate">{currentTrack?.title}</span>
                <span className="text-xs text-gray-400 truncate">{currentTrack?.artists?.map((a:any)=>a.name).join(', ')}</span>
              </div>
            </div>

            <button onClick={handleShare} className="flex items-center gap-4 py-3 text-white font-medium hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
              <span>Bagikan (Share)</span>
            </button>

            <button onClick={() => { setToastMessage("Ditambahkan ke antrean!"); setIsMenuOpen(false); }} className="flex items-center gap-4 py-3 text-white font-medium hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span>Tambahkan ke Antrean</span>
            </button>

            <button onClick={() => setIsMenuOpen(false)} className="mt-2 w-full py-3 bg-[#333333] hover:bg-[#444444] rounded-full font-semibold text-center text-white transition-colors">
              Tutup
            </button>
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

        <div className="flex flex-col items-center gap-1 cursor-pointer text-gray-400 hover:text-gray-200 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19V5a2 2 0 0 1 2-2h13.4a.5.5 0 0 1 .49.6l-1 5.2a.5.5 0 0 1-.49.4h-1.4"></path><path d="M4 19a2 2 0 0 0 2 2h14"></path><path d="M4 19h14"></path><path d="M8 12h8"></path><path d="M8 16h6"></path></svg>
          <span className="text-[10px] font-medium">Library</span>
        </div>

        <div className="flex flex-col items-center gap-1 cursor-pointer text-gray-400 hover:text-gray-200 transition-colors">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          <span className="text-[10px] font-medium">Profile</span>
        </div>
      </div>
    </div>
  );
                  }
