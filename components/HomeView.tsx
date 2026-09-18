'use client';

import React from 'react';

interface HomeViewProps {
  currentUser: any;
  quickPicks: any[];
  isLoadingQuickPicks: boolean;
  selectedMood: string | null;
  setSelectedMood: (mood: string | null) => void;
  moodSongs: any[];
  isLoadingMood: boolean;
  handlePlaySong: (song: any, playlist?: any[]) => void;
  setSelectedSongForMenu: (song: any) => void;
  setIsMenuOpen: (open: boolean) => void;
}

const MOODS = [
  'Santai', 'Kerja', 'Fokus', 'Olahraga', 'Pesta', 'Sedih', 'Romantis'
];

export const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  quickPicks,
  isLoadingQuickPicks,
  selectedMood,
  setSelectedMood,
  moodSongs,
  isLoadingMood,
  handlePlaySong,
  setSelectedSongForMenu,
  setIsMenuOpen,
}) => {
  return (
    <div className="p-4 pb-28 space-y-8 animate-in fade-in duration-300">
      {/* Greeting Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Selamat Datang, {currentUser?.email?.split('@')[0] || 'Teman'}! 👋
        </h1>
        <p className="text-xs text-gray-400 mt-1">Dengarkan musik favoritmu hari ini.</p>
      </div>

      {/* Mood Filters */}
      <div>
        <h2 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Suasana Hati</h2>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {MOODS.map((mood) => {
            const isActive = selectedMood === mood;
            return (
              <button
                key={mood}
                onClick={() => setSelectedMood(isActive ? null : mood)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-black shadow-md scale-105'
                    : 'bg-[#1e1e1e] text-gray-300 border border-white/5 hover:border-white/20'
                }`}
              >
                {mood}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mood Songs Result */}
      {selectedMood && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-white">Lagu untuk "{selectedMood}"</h2>
            <button 
              onClick={() => setSelectedMood(null)}
              className="text-xs text-gray-400 hover:text-white"
            >
              Reset
            </button>
          </div>

          {isLoadingMood ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-14 bg-[#181818] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {moodSongs.map((song) => (
                <div
                  key={song.videoId}
                  onClick={() => handlePlaySong(song, moodSongs)}
                  className="flex items-center justify-between bg-[#181818] hover:bg-[#252525] p-2.5 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={song.thumbnails?.[0]?.url}
                      alt={song.title}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold text-white truncate group-hover:text-gray-200">
                        {song.title}
                      </span>
                      <span className="text-xs text-gray-400 truncate">
                        {song.artists?.map((a: any) => a.name).join(', ')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSongForMenu(song);
                      setIsMenuOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Picks / Rekomendasi Cepat */}
      {!selectedMood && (
        <div>
          <h2 className="text-lg font-extrabold text-white mb-4">Rekomendasi Hari Ini</h2>

          {isLoadingQuickPicks ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 4, 5].map((n) => (
                <div key={n} className="h-44 bg-[#181818] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {quickPicks.map((song) => (
                <div
                  key={song.videoId}
                  onClick={() => handlePlaySong(song, quickPicks)}
                  className="bg-[#181818] border border-white/5 hover:bg-[#252525] p-3 rounded-2xl transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="w-full aspect-square bg-black/40 rounded-xl overflow-hidden mb-3 relative">
                    <img
                      src={song.thumbnails?.[song.thumbnails.length - 1]?.url || song.thumbnails?.[0]?.url}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white truncate">{song.title}</h3>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {song.artists?.map((a: any) => a.name).join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomeView;
                    
