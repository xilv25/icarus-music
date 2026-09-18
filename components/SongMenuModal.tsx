'use client';

import React from 'react';

interface SongMenuModalProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  selectedSongForMenu: any;
  toggleLikeSong: (song: any, e?: React.MouseEvent) => void;
  isSongLiked: (videoId: string) => boolean;
  setIsAddToPlaylistOpen: (open: boolean) => void;
  activePlaylistId?: string | null;
  handleRemoveFromPlaylist?: (playlistId: string, songId: string) => void;
}

export const SongMenuModal: React.FC<SongMenuModalProps> = ({
  isMenuOpen,
  setIsMenuOpen,
  selectedSongForMenu,
  toggleLikeSong,
  isSongLiked,
  setIsAddToPlaylistOpen,
  activePlaylistId,
  handleRemoveFromPlaylist,
}) => {
  if (!isMenuOpen || !selectedSongForMenu) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={() => setIsMenuOpen(false)}
    >
      <div 
        className="bg-[#222222] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Info Lagu */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <div className="w-14 h-14 bg-black rounded-lg overflow-hidden flex-shrink-0">
            {selectedSongForMenu.thumbnails?.[0]?.url && (
              <img 
                src={selectedSongForMenu.thumbnails[0].url} 
                alt="cover" 
                className="w-full h-full object-cover" 
              />
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <h3 className="text-base font-bold text-white truncate">{selectedSongForMenu.title}</h3>
            <p className="text-xs text-gray-400 truncate">
              {selectedSongForMenu.artists?.map((a: any) => a.name).join(', ')}
            </p>
          </div>
        </div>

        {/* Daftar Opsi */}
        <div className="flex flex-col gap-2">
          {/* Suka / Batal Suka */}
          <button
            onClick={(e) => {
              toggleLikeSong(selectedSongForMenu, e);
              setIsMenuOpen(false);
            }}
            className="flex items-center gap-4 w-full p-3 hover:bg-white/10 rounded-xl text-left text-sm font-medium text-white transition-colors"
          >
            {isSongLiked(selectedSongForMenu.videoId) ? (
              <>
                <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                Hapus dari Lagu Disukai
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                Sukai Lagu Ini
              </>
            )}
          </button>

          {/* Tambahkan ke Playlist */}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              setIsAddToPlaylistOpen(true);
            }}
            className="flex items-center gap-4 w-full p-3 hover:bg-white/10 rounded-xl text-left text-sm font-medium text-white transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambahkan ke Playlist
          </button>

          {/* Hapus dari Playlist saat ini (jika sedang di dalam view Playlist) */}
          {activePlaylistId && handleRemoveFromPlaylist && (
            <button
              onClick={() => {
                handleRemoveFromPlaylist(activePlaylistId, selectedSongForMenu.videoId);
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-4 w-full p-3 hover:bg-red-500/20 rounded-xl text-left text-sm font-medium text-red-400 transition-colors"
            >
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Hapus dari Playlist Ini
            </button>
          )}
        </div>

        <button
          onClick={() => setIsMenuOpen(false)}
          className="w-full py-3 bg-[#181818] text-gray-400 font-bold rounded-xl text-xs hover:text-white transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default SongMenuModal;
