'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player/youtube'), { ssr: false });

export default function Home() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' atau 'search'
  
  // Data States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Player States
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // Load History & Homepage Data on Mount
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('icarus_history') || '[]');
    setHistory(savedHistory);
    loadHomepageData(savedHistory);
  }, []);

  // Algoritma Rekomendasi
  const loadHomepageData = async (userHistory: any[]) => {
    setIsLoading(true);
    let query = "Trending Pop Music"; // Default random kalau history kosong
    
    if (userHistory.length > 0) {
      // Ambil vibes/artis dari lagu terakhir yang diputar
      const lastArtist = userHistory[0].artists?.[0]?.name;
      if (lastArtist) {
        query = `${lastArtist} mix`;
      }
    }

    try {
      const res = await fetch(`/api/search?q=${query}`);
      const json = await res.json();
      if (json.status === 'success') {
        setSuggestions(json.data.slice(0, 8)); // Ambil 8 lagu untuk suggestion
      }
    } catch (error) {
      console.error("Gagal memuat rekomendasi", error);
    }
    setIsLoading(false);
  };

  // Fungsi Play Lagu & Simpan ke History
  const playSong = (song: any) => {
    setCurrentTrack(song);
    setIsPlaying(true);
    setIsBuffering(true);

    // Update History (Maksimal simpan 10 lagu terakhir, cegah duplikat)
    const newHistory = [song, ...history.filter(s => s.videoId !== song.videoId)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('icarus_history', JSON.stringify(newHistory));
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentTrack) setIsPlaying(!isPlaying);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${searchQuery}`);
      const json = await res.json();
      if (json.status === 'success') {
        setSearchResults(json.data);
      }
    } catch (error) {
      console.error("Gagal mencari", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-gray-700">
      
      {/* HIDDEN YOUTUBE PLAYER */}
      {currentTrack && (
        <div className="hidden">
          <ReactPlayer
            url={`https://www.youtube.com/watch?v=${currentTrack.videoId}`}
            playing={isPlaying}
            onReady={() => setIsBuffering(false)}
            onBuffer={() => setIsBuffering(true)}
            onBufferEnd={() => setIsBuffering(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            volume={1}
            width="0"
            height="0"
          />
        </div>
      )}

      {/* TOP HEADER (Hanya tampil di Home) */}
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

      {/* MAIN CONTENT AREA */}
      <div className="pb-32 px-4 pt-2 overflow-y-auto">
        
        {/* VIEW: HOME */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-8 animate-fade-in">
            
            {/* Section: Start listening (Suggestions based on tastes) */}
            <section>
              <p className="text-xs text-gray-400 mb-1">Jump into a session based on your tastes</p>
              <h2 className="text-2xl font-bold tracking-tight mb-4">Start listening</h2>
              
              {isLoading ? (
                <div className="text-sm text-gray-500 animate-pulse">Curating your mix...</div>
              ) : (
                <div className="flex flex-col gap-0">
                  {suggestions.map((song, idx) => (
                    <div key={idx} onClick={() => playSong(song)} className="flex items-center justify-between p-2 -mx-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer group transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-12 h-12 bg-gray-800 rounded flex-shrink-0 overflow-hidden relative">
                           {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
                           {/* Overlay icon play saat di hover/aktif */}
                           {currentTrack?.videoId === song.videoId && isPlaying && (
                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                               <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                             </div>
                           )}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className={`text-base font-medium truncate ${currentTrack?.videoId === song.videoId ? 'text-white' : 'text-white'}`}>
                            {song.title}
                          </span>
                          <span className="text-sm text-gray-400 truncate">
                            {song.artists?.map((a: any) => a.name).join(', ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-gray-400">
                         <svg className="w-5 h-5 hidden group-hover:block hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                         <svg className="w-5 h-5 hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section: Your recent rotation (History) */}
            {history.length > 0 && (
              <section>
                <h2 className="text-xl font-bold tracking-tight mb-4">Your recent rotation</h2>
                <div className="flex flex-col gap-0">
                  {history.map((song, idx) => (
                    <div key={idx} onClick={() => playSong(song)} className="flex items-center justify-between p-2 -mx-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer group transition-colors">
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
                      <div className="flex items-center gap-4 text-gray-400">
                         {/* Icon Checkmark Abu-abu (bukan hijau) */}
                         <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                           <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                         </div>
                         <svg className="w-5 h-5 hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* VIEW: SEARCH */}
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

            <div className="grid grid-cols-2 gap-4">
               {isLoading ? (
                  <div className="col-span-2 text-center text-gray-400 mt-10">Searching...</div>
               ) : searchResults.length > 0 ? (
                 searchResults.map((song, idx) => (
                   <div key={idx} onClick={() => playSong(song)} className="bg-[#181818] p-3 rounded-lg flex flex-col cursor-pointer active:scale-95 transition-transform">
                     <div className="w-full aspect-square bg-gray-800 rounded mb-3 overflow-hidden shadow-lg">
                        {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
                     </div>
                     <span className="font-semibold text-sm truncate">{song.title}</span>
                     <span className="text-xs text-gray-400 truncate">{song.artists?.map((a: any) => a.name).join(', ')}</span>
                   </div>
                 ))
               ) : (
                  <div className="col-span-2 text-center text-gray-500 mt-10">Search your favorite track or artist</div>
               )}
            </div>
          </div>
        )}
      </div>

      {/* FLOATING MINI PLAYER */}
      {currentTrack && (
        <div className="fixed bottom-[72px] left-2 right-2 bg-[#2a2a2a]/95 backdrop-blur-md rounded-md p-2 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.8)] z-50 cursor-pointer">
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
            <div onClick={togglePlay} className="p-1 cursor-pointer">
              {isBuffering ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </div>
          </div>
          {/* Progress Bar Bawah Player */}
          <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-gray-600 rounded-full overflow-hidden">
            <div className="h-full bg-white w-1/3"></div>
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
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span className="text-[10px] font-medium">Premium</span>
        </div>

      </div>
    </div>
  );
        }
          
