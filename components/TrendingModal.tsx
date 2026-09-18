'use client';

import React from 'react';

interface TrendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trendSongs: any[];
  playSong: (song: any, queue: any[], index: number) => void;
  renderSongMenuButton: (song: any) => React.ReactNode;
}

export default function TrendingModal({
  isOpen,
  onClose,
  trendSongs,
  playSong,
  renderSongMenuButton,
}: TrendingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black text-white flex flex-col p-4 overflow-y-auto animate-fade-in">
      {/* Header Modal */}
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-black/90 backdrop-blur-md py-2 z-10">
        <h2 className="text-2xl font-bold">Trending & Viral Songs</h2>
        <button 
          onClick={onClose}
          className="text-xs font-bold px-4 py-2 bg-white/15 hover:bg-white/25 rounded-full transition-colors cursor-pointer"
        >
          Kembali
        </button>
      </div>

      {/* Daftar Lagu Trending */}
      <div className="flex flex-col gap-2 pb-20">
        {trendSongs && trendSongs.length > 0 ? (
          trendSongs.map((song: any, idx: number) => (
            <div 
              key={song.videoId || idx} 
              onClick={() => { 
                playSong(song, trendSongs, idx); 
                onClose(); 
              }}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                  {song.thumbnails?.[0]?.url && (
                    <img 
                      src={song.thumbnails[0].url} 
                      alt={song.title || 'Song cover'} 
                      className="w-full h-full object-cover" 
                    />
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold text-white truncate">{song.title}</span>
                  <span className="text-xs text-gray-400 truncate">
                    {song.artists?.map((a: any) => a.name).join(', ')}
                  </span>
                </div>
              </div>
              {renderSongMenuButton(song)}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-10 text-xs">Memuat daftar trending...</p>
        )}
      </div>
    </div>
  );
}
