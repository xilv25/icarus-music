// components/CreatePlaylistModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Users } from 'lucide-react';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, isCollaborative: boolean) => void;
}

export default function CreatePlaylistModal({ isOpen, onClose, onCreate }: CreatePlaylistModalProps) {
  const [name, setName] = useState('');
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onCreate(name, isCollaborative);
      setName('');
      setIsCollaborative(false);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white">Buat Playlist Baru</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Nama Playlist</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: Lagu Santai Malam"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
              required
            />
          </div>

          <div className="flex items-center justify-between bg-zinc-800/50 border border-zinc-700/50 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <Users size={20} className="text-blue-400" />
              <div>
                <p className="text-white text-xs font-semibold">Playlist Kolaborasi</p>
                <p className="text-zinc-400 text-[10px]">Izinkan teman menambahkan lagu bersama</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isCollaborative}
              onChange={(e) => setIsCollaborative(e.target.checked)}
              className="w-4 h-4 accent-white rounded cursor-pointer"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Membuat...' : 'Buat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
      }
