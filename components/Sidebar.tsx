// components/Sidebar.tsx
'use client';

import React from 'react';
import { Home, Search, Library, User, PlusCircle, Heart } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreatePlaylist: () => void;
  onOpenLikedSongs: () => void;
  playlists: any[];
  onSelectPlaylist: (playlist: any) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenCreatePlaylist,
  onOpenLikedSongs,
  playlists,
  onSelectPlaylist,
}: SidebarProps) {
  return (
    <div className="hidden md:flex flex-col w-64 bg-black border-r border-zinc-800 p-4 h-screen fixed left-0 top-0 z-30 justify-between">
      <div className="space-y-6">
        {/* Logo / App Name */}
        <div className="px-3 py-2">
          <h1 className="text-xl font-bold tracking-wider text-white">ICARUS</h1>
        </div>

        {/* Main Nav Links */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'home' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Home size={20} /> Beranda
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'search' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Search size={20} /> Cari
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'library' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Library size={20} /> Library
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'profile' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <User size={20} /> Profil
          </button>
        </div>

        <hr className="border-zinc-800 my-4" />

        {/* Library Shortcuts */}
        <div className="space-y-1">
          <button
            onClick={onOpenLikedSongs}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-700 to-indigo-800 flex items-center justify-center text-white">
              <Heart size={14} fill="currentColor" />
            </div>
            Lagu Disukai
          </button>
          <button
            onClick={onOpenCreatePlaylist}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <PlusCircle size={20} /> Buat Playlist
          </button>
        </div>
      </div>

      {/* Playlists Quick List */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-1 custom-scrollbar pr-1">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-3 mb-2">Playlist Kamu</p>
        {playlists.map((playlist, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPlaylist(playlist)}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 truncate transition-colors"
          >
            {playlist.name}
          </button>
        ))}
      </div>
    </div>
  );
      }
