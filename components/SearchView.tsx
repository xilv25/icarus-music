'use client';

import React from 'react';

interface SearchViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  searchResults: any[];
  isSearching: boolean;
  handlePlaySong: (song: any, playlist?: any[]) => void;
  setSelectedSongForMenu: (song: any) => void;
  setIsMenuOpen: (open: boolean) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  searchResults,
  isSearching,
  handlePlaySong,
  setSelectedSongForMenu,
  setIsMenuOpen,
}) => {
  return (
    <div className="p-4 pb-28 space-y-6 animate-in fade-in duration-300">
      {/* Form Pencarian */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari lagu, artis, atau album..."
          className="w-full bg-[#1e1e1e] border border-white/10 rounded-2xl px-11 py-3.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
        />
        <svg
          className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>

      {/* Hasil Pencarian */}
      <div>
        {isSearching ? (
          <div className="space-y-3 mt-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-16 bg-[#181818] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-2 mt-2">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Hasil Pencarian</h2>
            {searchResults.map((song) => (
              <div
                key={song.videoId}
                onClick={() => handlePlaySong(song, searchResults)}
                className="flex items-center justify-between bg-[#181818] hover:bg-[#252525] p-3 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-12 h-12 bg-black rounded-lg overflow-hidden flex-shrink-0">
                    {song.thumbnails?.[0]?.url && (
                      <img src={song.thumbnails[0].url} alt={song.title} className="w-full h-full object-cover" />
                    )}
                  </div>
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
        ) : searchQuery ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            Tidak ada lagu yang ditemukan untuk "{searchQuery}".
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 text-xs">
            Ketik nama lagu atau artis di atas untuk memulai pencarian.
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchView;
            
