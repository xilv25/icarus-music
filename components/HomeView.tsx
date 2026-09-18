// components/HomeView.tsx
'use client';

import React, { useState } from 'react';
import { Play, Plus, Radio, Music } from 'lucide-react';

interface HomeViewProps {
  featuredSongs: any[];
  podcasts: any[];
  onPlaySong: (song: any) => void;
  onAddToPlaylist: (song: any) => void;
}

export default function HomeView({ featuredSongs, podcasts, onPlaySong, onAddToPlaylist }: HomeViewProps) {
  const [subTab, setSubTab] = useState<'all' | 'music' | 'podcasts'>('all');

  return (
    <div className="w-full pb-28 px-4 pt-4 md:px-8 space-y-6">
      {/* Sub-tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSubTab('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            subTab === 'all' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setSubTab('music')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            subTab === 'music' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          Musik
        </button>
        <button
          onClick={() => setSubTab('podcasts')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            subTab === 'podcasts' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          Podcast
        </button>
      </div>

      {/* Section: Music / All */}
      {(subTab === 'all' || subTab === 'music') && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Music size={18} /> Musik Pilihan
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featuredSongs.map((song, index) => (
              <div
                key={index}
                className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl hover:bg-zinc-800/60 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-zinc-800">
                    <img
                      src={song.thumbnail || '/default-album.png'}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => onPlaySong(song)}
                      className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0"
                    >
                      <Play size={18} fill="black" className="ml-0.5" />
                    </button>
                  </div>
                  <h4 className="text-white text-sm font-semibold truncate">{song.title}</h4>
                  <p className="text-zinc-400 text-xs truncate mt-0.5">{song.artist}</p>
                </div>
                <button
                  onClick={() => onAddToPlaylist(song)}
                  className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                >
                  <Plus size={14} /> Tambah
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: Podcasts */}
      {(subTab === 'all' || subTab === 'podcasts') && (
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Radio size={18} /> Podcast Populer
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {podcasts.map((podcast, index) => (
              <div
                key={index}
                className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl hover:bg-zinc-800/60 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-zinc-800">
                    <img
                      src={podcast.thumbnail || '/default-album.png'}
                      alt={podcast.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => onPlaySong(podcast)}
                      className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0"
                    >
                      <Play size={18} fill="black" className="ml-0.5" />
                    </button>
                  </div>
                  <h4 className="text-white text-sm font-semibold truncate">{podcast.title}</h4>
                  <p className="text-zinc-400 text-xs truncate mt-0.5">{podcast.host || podcast.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
