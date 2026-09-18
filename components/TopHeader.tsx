'use client';

import React from 'react';

interface TopHeaderProps {
  setActiveTab: (tab: string) => void;
  homeSubTab: 'all' | 'music' | 'podcast';
  setHomeSubTab: (tab: 'all' | 'music' | 'podcast') => void;
  renderAvatar: (customClass?: string) => React.ReactNode;
}

export default function TopHeader({
  setActiveTab,
  homeSubTab,
  setHomeSubTab,
  renderAvatar
}: TopHeaderProps) {
  return (
    <div className="sticky top-0 bg-black/90 backdrop-blur-md z-40 px-4 py-4 flex gap-3 items-center">
      <div onClick={() => setActiveTab('profile')} className="cursor-pointer">
        {renderAvatar("w-8 h-8 text-xs font-bold")}
      </div>
      <button 
        onClick={() => setHomeSubTab('all')}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${homeSubTab === 'all' ? 'bg-white text-black' : 'bg-[#242424] text-white hover:bg-[#303030]'}`}
      >
        All
      </button>
      <button 
        onClick={() => setHomeSubTab('music')}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${homeSubTab === 'music' ? 'bg-white text-black' : 'bg-[#242424] text-white hover:bg-[#303030]'}`}
      >
        Music
      </button>
      <button 
        onClick={() => setHomeSubTab('podcast')}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${homeSubTab === 'podcast' ? 'bg-white text-black' : 'bg-[#242424] text-white hover:bg-[#303030]'}`}
      >
        Podcasts
      </button>
    </div>
  );
}
