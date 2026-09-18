// components/BottomNav.tsx
'use client';

import React from 'react';
import { Home, Search, Library, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount?: number;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-zinc-800 py-2 px-6 flex justify-around items-center z-50 md:hidden">
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === 'home' ? 'text-white' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Home size={22} />
        <span className="text-[10px] font-medium">Home</span>
      </button>

      <button
        onClick={() => setActiveTab('search')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === 'search' ? 'text-white' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Search size={22} />
        <span className="text-[10px] font-medium">Search</span>
      </button>

      <button
        onClick={() => setActiveTab('library')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === 'library' ? 'text-white' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Library size={22} />
        <span className="text-[10px] font-medium">Library</span>
      </button>

      <button
        onClick={() => setActiveTab('profile')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === 'profile' ? 'text-white' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <User size={22} />
        <span className="text-[10px] font-medium">Profile</span>
      </button>
    </div>
  );
}
