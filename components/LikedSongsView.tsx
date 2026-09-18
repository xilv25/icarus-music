// components/LikedSongsView.tsx
'use client';

import React from 'react';
import { ArrowLeft, Heart, Play } from 'lucide-react';

interface LikedSongsViewProps {
  likedSongs: any[];
  onBack: () => void;
  onPlaySong: (song: any) => void;
  onToggleLike: (song: any) => void;
}

export default function LikedSongsView({
  likedSongs,
  onBack,
  onPlaySong,
  onToggleLike,
}: LikedSongsViewProps) {
  return (
    <div className="w-full pb-28 px-4 pt-4 md:px-8 space-y-6 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-semibold"
      >
        <ArrowLeft size={16} /> Kembali
      </button>

      {/* Header Liked Songs */}
      <div className="flex items-center gap-6 bg-gradient-to-r from-purple-900/60 via-zinc-900 to-zinc-900 p-6 rounded-2xl border border-zinc-800">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-gradient-to-br from-purple-700 to-indigo-800 flex items-center justify-center text-white shadow-2xl shrink-0">
          <Heart size={48} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Lagu Disukai</h1>
          <p className="text-zinc-400 text-xs mt-1">{likedSongs.length} lagu tersimpan di akunmu</p>
        </div>
      </div>

      {/* Daftar Lagu */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white">Daftar Lagu Disukai</h3>
        {likedSongs.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800/60 rounded-xl">
            <p className="text-zinc-500 text-xs">Belum ada lagu yang kamu sukai.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {likedSongs.map((song, index) => (
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
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onPlaySong(song)}
                    className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <Play size={14} fill="black" className="ml-0.5" />
                  </button>
                  <button
                    onClick={() => onToggleLike(song)}
                    className="text-green-500 hover:text-zinc-400 transition-colors p-1"
                  >
                    <Heart size={18} fill="currentColor" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
