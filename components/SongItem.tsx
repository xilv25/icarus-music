'use client';

import React from 'react';

interface SongItemProps {
  song: any;
  currentTrack?: any;
  isPlaying?: boolean;
  playedBefore?: boolean;
  liked?: boolean;
  showLikeButton?: boolean;
  customIndicator?: React.ReactNode;
  onPlay?: () => void;
  onToggleLike?: (e: React.MouseEvent) => void;
  onOpenMenu?: (e: React.MouseEvent) => void;
  onMenuOpen?: (song: any) => void;
  containerClassName?: string;
  imageSize?: string;
}

export default function SongItem({
  song,
  currentTrack,
  isPlaying = false,
  playedBefore = false,
  liked = false,
  showLikeButton = true,
  customIndicator,
  onPlay,
  onToggleLike,
  onOpenMenu,
  onMenuOpen,
  containerClassName = "hover:bg-white/10",
  imageSize = "w-12 h-12",
}: SongItemProps) {
  const artistName = song.artists?.map((a: any) => a.name).join(', ') || '';
  const isActive = currentTrack?.videoId === song.videoId;

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMenuOpen) {
      onMenuOpen(song);
    }
    if (onOpenMenu) {
      onOpenMenu(e);
    }
  };

  return (
    <div 
      onClick={onPlay} 
      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer group transition-all ${containerClassName}`}
    >
      {/* Bagian Kiri: Thumbnail, Judul, Artist, & Indikator */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={`${imageSize} bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden relative shadow-inner`}>
           {song.thumbnails?.[0]?.url && (
             <img src={song.thumbnails[0].url} alt={song.title || 'Song cover'} className="w-full h-full object-cover" />
           )}
           {isActive && isPlaying && (
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
               <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
             </div>
           )}
        </div>

        <div className="flex flex-col overflow-hidden pr-2">
          <div className="flex items-center gap-1.5">
            <span className={`text-base font-medium truncate max-w-[180px] sm:max-w-[220px] ${isActive ? 'text-green-400 font-bold' : 'text-white'}`}>
              {song.title}
            </span>
            {playedBefore && !customIndicator && (
              <span className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center text-[10px] text-white flex-shrink-0" title="Pernah diputar">
                ✓
              </span>
            )}
            {customIndicator}
          </div>
          <span className="text-sm text-gray-400 truncate max-w-[180px] sm:max-w-[220px]">{artistName}</span>
        </div>
      </div>

      {/* Bagian Kanan: Tombol Like & Tombol Menu Titik Tiga */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {showLikeButton && onToggleLike && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike(e);
            }} 
            className="p-1" 
            title={liked ? "Hapus dari Liked Songs" : "Sukai Lagu"}
          >
            {liked ? (
              <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            )}
          </button>
        )}
        
        {(onOpenMenu || onMenuOpen) && (
          <button 
            onClick={handleMenuClick} 
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            title="Opsi Lagu"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
