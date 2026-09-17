'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State untuk Audio Player
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFetchingAudio, setIsFetchingAudio] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${query}`);
      const json = await res.json();
      if (json.status === 'success') {
        setSongs(json.data);
      }
    } catch (error) {
      console.error("Gagal mencari lagu", error);
    }
    setLoading(false);
  };

  // Fungsi untuk memutar lagu saat kartu diklik
  const playSong = async (song: any) => {
    setCurrentTrack(song);
    setIsPlaying(false);
    setAudioUrl(null);
    setIsFetchingAudio(true);

    try {
      const res = await fetch(`/api/stream?id=${song.videoId}`);
      const json = await res.json();
      if (json.status === 'success') {
        setAudioUrl(json.url);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Gagal mengambil stream audio", error);
    }
    setIsFetchingAudio(false);
  };

  // Efek untuk memutar audio otomatis setelah URL didapat
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
    }
  }, [audioUrl]);

  // Fungsi Play/Pause dari tombol bawah
  const togglePlay = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      
      {/* SIDEBAR (Desktop) - Tetap sama */}
      <div className="w-64 bg-black p-6 hidden md:flex flex-col gap-6">
        <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold">I</div>
          Icarus
        </div>
        <nav className="flex flex-col gap-4 text-gray-400 font-semibold mt-4">
          <a href="#" className="text-white hover:text-white transition flex items-center gap-4">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3l-10 9h3v9h14v-9h3z"/></svg>
            Home
          </a>
          <a href="#" className="hover:text-white transition flex items-center gap-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            Search
          </a>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-gradient-to-b from-[#1f1f1f] to-[#121212] rounded-lg m-2 flex flex-col relative overflow-y-auto">
        
        {/* TOP NAVBAR */}
        <div className="sticky top-0 bg-[#121212]/70 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
          <form onSubmit={handleSearch} className="w-full max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-[#242424] text-white px-10 py-3 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-white/30 transition shadow-lg text-sm font-medium" 
              placeholder="What do you want to listen to?" 
            />
          </form>
        </div>

        {/* CONTENT AREA */}
        <div className="p-6 pb-28">
          <h2 className="text-2xl font-bold mb-6">
            {songs.length > 0 ? `Results for "${query}"` : "Good Afternoon"}
          </h2>
          
          {loading ? (
             <div className="flex items-center justify-center h-40 text-gray-400">Loading tracks...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {songs.map((song, idx) => (
                <div 
                  key={idx} 
                  onClick={() => playSong(song)}
                  className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition group flex flex-col cursor-pointer shadow-lg"
                >
                  <div className="w-full aspect-square bg-[#282828] rounded-md mb-4 relative shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden">
                    {song.thumbnails && song.thumbnails.length > 0 && (
                       <img src={song.thumbnails[0].url} alt={song.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-2 right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-xl">
                       <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                  <h3 className="font-semibold text-white truncate text-base mb-1">{song.title}</h3>
                  <p className="text-sm text-gray-400 truncate">
                    {song.artists ? song.artists.map((a: any) => a.name).join(', ') : 'Unknown Artist'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AUDIO ELEMENT (Hidden) */}
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          onEnded={() => setIsPlaying(false)}
          autoPlay 
        />
      )}

      {/* BOTTOM PLAYER BAR */}
      <div className="absolute bottom-0 w-full h-24 bg-black border-t border-[#282828] px-4 flex items-center justify-between z-50">
        
        {/* Track Info */}
        <div className="flex items-center gap-4 w-1/3 min-w-[180px]">
          {currentTrack ? (
            <>
              <div className="w-14 h-14 bg-[#282828] rounded-md shadow-md overflow-hidden hidden sm:block">
                <img src={currentTrack.thumbnails[0].url} alt="cover" className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-semibold text-white hover:underline cursor-pointer truncate">
                  {currentTrack.title}
                </div>
                <div className="text-xs text-gray-400 hover:underline cursor-pointer truncate">
                   {currentTrack.artists ? currentTrack.artists.map((a: any) => a.name).join(', ') : 'Unknown'}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-[#282828] rounded-md shadow-md hidden sm:block"></div>
              <div>
                <div className="text-sm font-semibold text-white cursor-pointer truncate">Select a track</div>
                <div className="text-xs text-gray-400 cursor-pointer truncate">Icarus Music</div>
              </div>
            </>
          )}
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center justify-center w-1/3 max-w-[722px] gap-2">
          <div className="flex items-center gap-6">
            {/* Prev Button */}
            <svg className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            
            {/* Play/Pause Button */}
            <div 
              onClick={togglePlay}
              className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-105 transition cursor-pointer"
            >
              {isFetchingAudio ? (
                 <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                 <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                 <svg className="w-4 h-4 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </div>

            {/* Next Button */}
            <svg className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </div>
          
          {/* Progress Bar (Visual Only for now) */}
          <div className="w-full flex items-center gap-2 group">
            <span className="text-[11px] text-gray-400">0:00</span>
            <div className="h-1 bg-[#4d4d4d] rounded-full flex-1 relative cursor-pointer">
              <div className="h-full bg-white rounded-full w-0 group-hover:bg-[#1db954] transition-colors"></div>
            </div>
            <span className="text-[11px] text-gray-400">--:--</span>
          </div>
        </div>

        {/* Volume Controls */}
        <div className="w-1/3 flex justify-end items-center gap-4 min-w-[180px] hidden md:flex text-gray-400">
           <svg className="w-5 h-5 hover:text-white cursor-pointer" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
           <div className="w-24 h-1 bg-[#4d4d4d] rounded-full cursor-pointer group">
             <div className="h-full bg-white rounded-full w-2/3 group-hover:bg-[#1db954]"></div>
           </div>
        </div>
      </div>
    </div>
  );
              }
              
