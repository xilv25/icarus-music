'use client';

import React from 'react';

interface MiniPlayerProps {
  currentTrack: any;
  isPlayerOpen: boolean;
  setIsPlayerOpen: (open: boolean) => void;
  isPlaying: boolean;
  isBuffering: boolean;
  playedProgress: number;
  togglePlay: (e?: React.MouseEvent) => void;
  toggleLikeSong: (song: any, e?: React.MouseEvent) => void;
  isSongLiked: (videoId: string) => boolean;
}

export default function MiniPlayer({
  currentTrack,
  isPlayerOpen,
  setIsPlayerOpen,
  isPlaying,
  isBuffering,
  playedProgress,
  togglePlay,
  toggleLikeSong,
  isSongLiked,
}: MiniPlayerProps) {
  if (!currentTrack || isPlayerOpen) return null;

  return (
    <div 
      onClick={() => setIsPlayerOpen(true)}
      className="fixed bottom-[72px] left-2 right-2 bg-[#2a2a2a] rounded-md p-2 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.8)] z-50 cursor-pointer hover:bg-[#333333] transition-colors"
    >
      {/* Sisi Kiri: Cover & Info Lagu */}
      <div className="flex items-center gap-3 overflow-hidden flex-1">
        <div className="w-10 h-10 bg-black rounded overflow-hidden flex-shrink-0">
           {currentTrack.thumbnails?.[0]?.url && (
             <img src={currentTrack.thumbnails[0].url} alt="cover" className="w-full h-full object-cover" />
           )}
        </div>
        <div className="flex flex-col overflow-hidden">
           <span className="text-sm font-semibold text-white truncate">{currentTrack.title}</span>
           <span className="text-xs text-gray-300 truncate">
             {currentTrack.artists?.map((a: any) => a.name).join(', ')}
           </span>
        </div>
      </div>
      
      {/* Sisi Kanan: Tombol Like & Play/Pause */}
      <div className="flex items-center gap-3 px-2 text-white">
        <button onClick={(e) => toggleLikeSong(currentTrack, e)} className="p-1">
          {isSongLiked(currentTrack.videoId) ? (
            <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
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
      
      {/* Garis Progres Lagu di Bagian Bawah */}
      <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-gray-600 rounded-full overflow-hidden">
        <div className="h-full bg-white transition-all duration-300 ease-linear" style={{ width: `${playedProgress * 100}%` }}></div>
      </div>
    </div>
  );
                                                                                         }
