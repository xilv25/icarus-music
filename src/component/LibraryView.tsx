'use client';

import React from 'react';

interface LibraryViewProps {
  likedSongs: any[];
  userPlaylists: any[];
  setIsCreatePlaylistOpen: (open: boolean) => void;
  handlePlaySong: (song: any, playlist?: any[]) => void;
  setSelectedPlaylist: (playlist: any) => void;
  selectedPlaylist: any;
  handleDeletePlaylist: (playlistId: string) => void;
  setSelectedSongForMenu: (song: any) => void;
  setIsMenuOpen: (open: boolean) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  likedSongs,
  userPlaylists,
  setIsCreatePlaylistOpen,
  handlePlaySong,
  setSelectedPlaylist,
  selectedPlaylist,
  handleDeletePlaylist,
  setSelectedSongForMenu,
  setIsMenuOpen,
}) => {
  // Jika sedang membuka detail playlist tertentu
  if (selectedPlaylist) {
    return (
      <div className="p-4 pb-28 space-y-6 animate-in fade-in duration-300">
        <button
          onClick={() => setSelectedPlaylist(null)}
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Koleksi
        </button>

        <div className="flex items-end justify-between border-b border-white/10 pb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Playlist</span>
            <h1 className="text-2xl font-black text-white mt-1">{selectedPlaylist.title}</h1>
            {selectedPlaylist.description && (
              <p className="text-xs text-gray-400 mt-1">{selectedPlaylist.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">{selectedPlaylist.songs?.length || 0} lagu</p>
          </div>

          {selectedPlaylist.id !== 'liked-songs' && (
            <button
              onClick={() => {
                handleDeletePlaylist(selectedPlaylist.id);
                setSelectedPlaylist(null);
              }}
              className="p-2 text-red-400 hover:text-red-300 transition-colors"
              title="Hapus Playlist"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        <div className="space-y-2">
          {selectedPlaylist.songs && selectedPlaylist.songs.length > 0 ? (
            selectedPlaylist.songs.map((song: any) => (
              <div
                key={song.videoId}
                onClick={() => handlePlaySong(song, selectedPlaylist.songs)}
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
            ))
          ) : (
            <div className="text-center py-12 text-gray-500 text-xs">
              Belum ada lagu di playlist ini.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Tampilan Utama Koleksi
  return (
    <div className="p-4 pb-28 space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-white tracking-tight">Koleksi Musik</h1>
        <button
          onClick={() => setIsCreatePlaylistOpen(true)}
          className="p-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white rounded-full transition-colors border border-white/10"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Card Lagu Disukai */}
        <div
          onClick={() =>
            setSelectedPlaylist({
              id: 'liked-songs',
              title: 'Lagu Disukai',
              description: 'Semua lagu yang kamu sukai',
              songs: likedSongs,
            })
          }
          className="bg-gradient-to-br from-indigo-900/60 to-purple-900/40 border border-indigo-500/20 p-4 rounded-2xl cursor-pointer hover:border-indigo-500/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">Lagu Disukai</h3>
              <p className="text-xs text-gray-400">{likedSongs.length} lagu</p>
            </div>
          </div>
        </div>

        {/* Daftar Playlist Buatan User */}
        {userPlaylists.map((pl) => (
          <div
            key={pl.id}
            onClick={() => setSelectedPlaylist(pl)}
            className="bg-[#181818] border border-white/5 p-4 rounded-2xl cursor-pointer hover:bg-[#222222] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 font-black text-lg">
                {pl.title.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-gray-200 transition-colors">{pl.title}</h3>
                <p className="text-xs text-gray-400">{pl.songs?.length || 0} lagu</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryView;
                
