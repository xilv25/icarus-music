'use client';

import React from 'react';

interface NavigationProps {
  activeTab: 'home' | 'search' | 'library';
  setActiveTab: (tab: 'home' | 'search' | 'library') => void;
  currentUser: any;
  setIsProfileOpen: (open: boolean) => void;
  setIsCreatePlaylistOpen: (open: boolean) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setIsProfileOpen,
  setIsCreatePlaylistOpen,
}) => {
  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-black text-sm tracking-tighter">
            IC
          </div>
          <span className="font-extrabold text-lg tracking-wider text-white">ICARUS</span>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'library' && (
            <button
              onClick={() => setIsCreatePlaylistOpen(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Buat Playlist"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}

          <button
            onClick={() => setIsProfileOpen(true)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-md hover:scale-105 transition-transform"
          >
            {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
          </button>
        </div>
      </header>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-white/10 z-50 flex justify-around items-center h-[64px] px-2">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            activeTab === 'home' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <svg className="w-6 h-6" fill={activeTab === 'home' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            activeTab === 'search' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === 'search' ? '2.5' : '2'} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[10px] mt-1 font-medium">Cari</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            activeTab === 'library' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <svg className="w-6 h-6" fill={activeTab === 'library' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-[10px] mt-1 font-medium">Koleksi</span>
        </button>
      </nav>
    </>
  );
};

export default Navigation;
