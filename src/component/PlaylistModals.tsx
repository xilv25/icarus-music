'use client';

import React from 'react';

interface PlaylistModalsProps {
  // Modal Buat Playlist
  isCreatePlaylistOpen: boolean;
  setIsCreatePlaylistOpen: (open: boolean) => void;
  newPlaylistTitle: string;
  setNewPlaylistTitle: (title: string) => void;
  newPlaylistDesc: string;
  setNewPlaylistDesc: (desc: string) => void;
  handleCreatePlaylistSubmit: (e: React.FormEvent) => void;

  // Modal Tambah ke Playlist
  isAddToPlaylistOpen: boolean;
  setIsAddToPlaylistOpen: (open: boolean) => void;
  userPlaylists: any[];
  selectedSongForMenu: any;
  handleAddToPlaylist: (playlistId: string) => void;
}

export const PlaylistModals: React.FC<PlaylistModalsProps> = ({
  isCreatePlaylistOpen,
  setIsCreatePlaylistOpen,
  newPlaylistTitle,
  setNewPlaylistTitle,
  newPlaylistDesc,
  setNewPlaylistDesc,
  handleCreatePlaylistSubmit,
  isAddToPlaylistOpen,
  setIsAddToPlaylistOpen,
  userPlaylists,
  selectedSongForMenu,
  handleAddToPlaylist,
}) => {
  return (
    <>
      {/* Modal Buat Playlist Baru */}
      {isCreatePlaylistOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-white mb-4">Buat Playlist Baru</h3>
            <form onSubmit={handleCreatePlaylistSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1 block">Judul Playlist</label>
                <input
                  type="text"
                  required
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  placeholder="Misal: Vibe Malam / Workout"
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1 block">Deskripsi (Opsional)</label>
                <textarea
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Kumpulan lagu favorit..."
                  rows={3}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatePlaylistOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-white text-black rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                >
                  Buat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambahkan Lagu ke Playlist */}
      {isAddToPlaylistOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Tambahkan ke Playlist</h3>
              <button 
                onClick={() => setIsAddToPlaylistOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedSongForMenu && (
              <p className="text-xs text-gray-400 mb-4 truncate">
                Lagu: <span className="text-white font-semibold">{selectedSongForMenu.title}</span>
              </p>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {userPlaylists.length > 0 ? (
                userPlaylists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => handleAddToPlaylist(pl.id)}
                    className="w-full flex items-center justify-between bg-[#121212] hover:bg-white/10 p-3 rounded-xl text-left transition-colors group"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-white">{pl.title}</h4>
                      <p className="text-xs text-gray-400">{pl.songs?.length || 0} lagu</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-xs">
                  Belum ada playlist. Buat playlist terlebih dahulu.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlaylistModals;
        
