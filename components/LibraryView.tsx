// components/LibraryView.tsx
'use client';

import React from 'react';
import { Heart, Plus, ListMusic, Users } from 'lucide-react';

interface LibraryViewProps {
  likedSongs: any[];
  playlists: any[];
  onOpenLikedSongs: () => void;
  onOpenCreatePlaylist: () => void;
  onSelectPlaylist: (playlist: any) => void;
}

export default function LibraryView({
  likedSongs,
  playlists,
  onOpenLikedSongs,
  onOpenCreatePlaylist,
  onSelectPlaylist,
}: LibraryViewProps) {
  return (
    <div className="w-full pb-28 px-4 pt-4 md:px-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Koleksi Library</h2>
        <button
          onClick={onOpenCreatePlaylist}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black rounded-lg text-xs font-semibold hover:bg-zinc-200 transition-colors"
        >
          <Plus size={16} /> Buat Playlist
        </button>
      </div>

      {/* Liked Songs Shortcut Card */}
      <div
        onClick={onOpenLikedSongs}
        className="bg-gradient-to-r from-purple-900/40 via-zinc-900 to-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:border-zinc-700 transition-all shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-700 to-indigo-800 flex items-center justify-center text-white shadow-md">
            <Heart size={24} fill="currentColor" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Lagu Disukai</h3>
            <p className="text-zinc-400 text-xs mt-0.5">{likedSongs.length} lagu tersimpan</p>
          </div>
        </div>
        <span className="text-xs font-medium text-zinc-400 bg-zinc-800/80 px-3 py-1 rounded-full">Buka</span>
      </div>

      {/* Playlists List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ListMusic size={18} /> Playlist Kamu
        </h3>
        {playlists.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl">
            <p className="text-zinc-400 text-xs">Belum ada playlist yang dibuat.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {playlists.map((playlist, index) => (
              <div
                key={index}
                onClick={() => onSelectPlaylist(playlist)}
                className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl hover:bg-zinc-800/60 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 overflow-hidden">
                    {playlist.thumbnail ? (
                      <img src={playlist.thumbnail} alt={playlist.name} className="w-full h-full object-cover" />
                    ) : (
                      <ListMusic size={20} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-semibold truncate">{playlist.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-zinc-400 text-xs">{playlist.songs?.length || 0} lagu</span>
                      {playlist.is_collaborative && (
                        <span className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                          <Users size={10} /> Kolaborasi
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
