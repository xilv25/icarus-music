'use client';

import React from 'react';

interface Playlist {
  id: string;
  name: string;
  songs: any[];
  isCollaborative?: boolean;
  collaborator?: string;
  addedBy?: { [songId: string]: string };
}

interface AddToPlayListModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
  onSelectPlaylist: (playlistId: string) => void;
  onCreatePlaylistClick: () => void;
}

export default function AddToPlayListModal({
  isOpen,
  onClose,
  playlists,
  onSelectPlaylist,
  onCreatePlaylistClick,
}: AddToPlayListModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[140] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" 
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-[#1c1c1c] border border-white/10 w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl"
      >
        <h3 className="text-lg font-bold text-white">Tambah ke Playlist</h3>
        
        {/* Tombol Buat Playlist Baru */}
        <button 
          type="button"
          onClick={onCreatePlaylistClick}
          className="w-full py-3 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <span>+ Create a Playlist</span>
        </button>

        {/* Garis Pemisah */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-[10px] uppercase">Atau pilih playlist</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Daftar Playlist */}
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto scrollbar-none">
          {playlists.length > 0 ? (
            playlists.map((pl) => (
              <div 
                key={pl.id} 
                onClick={() => onSelectPlaylist(pl.id)} 
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer flex justify-between items-center text-sm font-medium text-white transition-colors"
              >
                <span>{pl.name} {pl.isCollaborative && '🤝'}</span>
                <span className="text-xs text-gray-400">{pl.songs.length} lagu</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">Belum ada playlist.</p>
          )}
        </div>

        {/* Tombol Tutup */}
        <button 
          type="button"
          onClick={onClose} 
          className="w-full py-2.5 bg-[#2a2a2a] text-gray-300 font-semibold rounded-xl text-xs mt-1 hover:bg-[#333] transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
