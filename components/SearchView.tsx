// components/SearchView.tsx
'use client';

import React, { useState } from 'react';
import { Search as SearchIcon, Play, Plus } from 'lucide-react';

interface SearchViewProps {
  onSearch: (query: string) => void;
  searchResults: any[];
  onPlaySong: (song: any) => void;
  onAddToPlaylist: (song: any) => void;
}

export default function SearchView({ onSearch, searchResults, onPlaySong, onAddToPlaylist }: SearchViewProps) {
  const [query, setQuery] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(query);
    }
  };

  return (
    <div className="w-full pb-24 px-4 pt-4 md:px-8 space-y-6">
      <div className="relative max-w-xl mx-auto">
        <SearchIcon size={20} className="absolute left-4 top-3.5 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Cari lagu, artis, atau podcast..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors shadow-lg"
        />
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        <h3 className="text-lg font-bold text-white">Hasil Pencarian</h3>
        {searchResults.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 text-sm">
            Ketik sesuatu dan tekan Enter untuk mulai mencari musik.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {searchResults.map((song, index) => (
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
        )}
      </div>
    </div>
  );
}
