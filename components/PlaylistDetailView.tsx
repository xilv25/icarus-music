// components/PlaylistDetailView.tsx
'use client';

import React from 'react';
import { ArrowLeft, Play, Trash2, Plus, Users, Music } from 'lucide-react';

interface PlaylistDetailViewProps {
  playlist: any;
  onBack: () => void;
  onPlaySong: (song: any) => void;
  onRemoveSong?: (songId: string) => void;
  onAddSongClick: () => void;
  onDeletePlaylist?: () => void;
}

export default function PlaylistDetailView({
  playlist,
  onBack,
  onPlaySong,
  onRemoveSong,
  onAddSongClick,
  onDeletePlaylist,
}: PlaylistDetailViewProps) {
  if (!playlist) return null;

  return (
    <div className="w-full pb-28 px-4 pt-4 md:px-8 space-y-6 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-semibold"
      >
        <ArrowLeft size={16} /> Kembali
      </button>

      {/* Header Playlist */}
      <div className="flex flex-col md:flex-row items-start md:items-end gap-6 bg-gradient-to-b from-zinc-800/60 to-zinc-900/40 p-6 rounded-2xl border border-zinc-800">
        <div className="w-40 h-40 md:w-48 md:h-48 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 overflow-hidden shadow-2xl shrink-0">
          {playlist.thumbnail ? (
            <img src={playlist.thumbnail} alt={playlist.name} className="w-full h-full object-cover" />
          ) : (
            <Music size={48} />
          )}
        </div>
        <div className="space-y-2 w-full">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{playlist.name}</h1>
            {playlist.is_collaborative && (
              <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                <Users size={12} /> Kolaborasi
              </span>
            )}
          </div>
          <p className="text-zinc-400 text-xs">{playlist.songs?.length || 0} lagu di dalam playlist ini</p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onAddSongClick}
              className="px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Plus size={16} /> Tambah Lagu
            </button>
            {onDeletePlaylist && (
              <button
                onClick={onDeletePlaylist}
                className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-semibold transition-colors border border-red-500/20 flex items-center gap-1.5"
              >
                <Trash2 size={16} /> Hapus Playlist
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Daftar Lagu */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white">Daftar Lagu</h3>
        {!playlist.songs || playlist.songs.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800/60 rounded-xl">
            <p className="text-zinc-500 text-xs">Belum ada lagu dalam playlist ini.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {playlist.songs.map((song: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:bg-zinc-800/60 transition-colors group"
              >
                <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => onPlaySong(song)}>
                  <img src={song.thumbnail} alt={song.title} className="w-10 h-10 rounded object-cover shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-white text-sm font-semibold truncate hover:underline">{song.title}</p>
                    <p className="text-zinc-400 text-xs truncate">{song.artist}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPlaySong(song)}
                    className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <Play size={14} fill="black" className="ml-0.5" />
                  </button>
                  {onRemoveSong && (
                    <button
                      onClick={() => onRemoveSong(song.id || song.youtubeId)}
                      className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
