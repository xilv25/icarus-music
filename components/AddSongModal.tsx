// components/AddSongModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Search, Plus } from 'lucide-react';

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistName: string;
  onSearchSongs: (query: string) => Promise<any[]>;
  onAddSong: (song: any) => void;
}

export default function AddSongModal({
  isOpen,
  onClose,
  playlistName,
  onSearchSongs,
  onAddSong,
}: AddSongModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await onSearchSongs(query);
      setResults(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-white">Tambah Lagu</h2>
            <p className="text-zinc-400 text-xs">Ke playlist: <span className="text-white font-medium">{playlistName}</span></p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <Search size={18} className="absolute left-3.5 top-3 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari lagu dari YouTube..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
          />
        </form>

        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
          {loading ? (
            <p className="text-zinc-500 text-xs text-center py-10">Mencari lagu...</p>
          ) : results.length === 0 ? (
            <p className="text-zinc-500 text-xs text-center py-10">Ketik kata kunci untuk mencari lagu.</p>
          ) : (
            results.map((song, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-800/40 border border-zinc-800 hover:bg-zinc-800/80 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={song.thumbnail} alt={song.title} className="w-10 h-10 rounded object-cover shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-white text-sm font-semibold truncate">{song.title}</p>
                    <p className="text-zinc-400 text-xs truncate">{song.artist}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onAddSong(song);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
                >
                  <Plus size={14} /> Tambah
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
                  }
