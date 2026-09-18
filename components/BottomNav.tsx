'use client';

import React from 'react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setIsFullScreenSearch: (val: boolean) => void;
}

export default function BottomNav({ activeTab, setActiveTab, setIsFullScreenSearch }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 w-full h-[64px] bg-gradient-to-t from-black via-black/95 to-black/80 px-6 flex items-center justify-between z-40 pb-2">
      <div onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'home' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
        <svg className="w-6 h-6" fill={activeTab === 'home' ? "currentColor" : "none"} stroke="currentColor" strokeWidth={activeTab === 'home' ? "0" : "2"} viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        <span className="text-[10px] font-medium">Home</span>
      </div>

      <div onClick={() => { setActiveTab('search'); setIsFullScreenSearch(false); }} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'search' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={activeTab === 'search' ? "3" : "2"} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <span className="text-[10px] font-medium">Search</span>
      </div>

      <div onClick={() => setActiveTab('library')} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'library' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={activeTab === 'library' ? "3" : "2"} viewBox="0 0 24 24"><path d="M4 19V5a2 2 0 0 1 2-2h13.4a.5.5 0 0 1 .49.6l-1 5.2a.5.5 0 0 1-.49.4h-1.4"></path><path d="M4 19a2 2 0 0 0 2 2h14"></path><path d="M4 19h14"></path><path d="M8 12h8"></path><path d="M8 16h6"></path></svg>
        <span className="text-[10px] font-medium">Library</span>
      </div>

      <div onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'profile' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        <span className="text-[10px] font-medium">Profile</span>
      </div>
    </div>
  );
}
