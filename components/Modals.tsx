'use client';

import React from 'react';

interface ModalsProps {
  // Profil User Lain
  viewingProfileCard: any;
  setViewingProfileCard: (user: any) => void;
  renderAvatar: (customClass?: string, overridePic?: string, overrideUsername?: string) => React.ReactNode;
  viewingUserPlaylistsCount: number;
  viewingUserFollowers: number;
  viewingUserFollowing: number;
  toggleFollowUser: () => void;
  isFollowingSelectedUser: boolean;

  // Followers Modal
  isFollowersModalOpen: boolean;
  setIsFollowersModalOpen: (val: boolean) => void;
  followersCount: number;
  followersList: any[];
  removeFollowerFromList: (id: string) => void;

  // Following Modal
  isFollowingModalOpen: boolean;
  setIsFollowingModalOpen: (val: boolean) => void;
  followingCount: number;
  followingList: any[];
  unfollowFromList: (id: string) => void;

  // Search Trend Modal
  isFullScreenSearch: boolean;
  setIsFullScreenSearch: (val: boolean) => void;
  trendSongs: any[];
  playSong: (song: any, queue?: any[], index?: number) => void;
  renderSongMenuButton: (song: any) => React.ReactNode;

  // Song Menu (Titik Tiga) Modal
  isMenuOpen: boolean;
  setIsMenuOpen: (val: boolean) => void;
  selectedSongForMenu: any;
  currentTrack: any;
  setSongToAddToPlaylist: (song: any) => void;
  setIsAddToPlaylistOpen: (val: boolean) => void;
  toggleLikeSong: (song: any) => void;
  isSongLiked: (id: string) => boolean;
  setToastMessage: (msg: string) => void;

  // Add to Playlist Modal
  isAddToPlaylistOpen: boolean;
  setIsCreatePlaylistOpen: (val: boolean) => void;
  playlists: any[];
  addSongToPlaylist: (id: string) => void;

  // Create Playlist Modal
  isCreatePlaylistOpen: boolean;
  handleCreatePlaylist: (e: React.FormEvent) => void;
  newPlaylistName: string;
  setNewPlaylistName: (val: string) => void;
  isCollaborativePlaylist: boolean;
  setIsCollaborativePlaylist: (val: boolean) => void;
  collaboratorUsername: string;
  setCollaboratorUsername: (val: string) => void;
}

export default function Modals({
  viewingProfileCard,
  setViewingProfileCard,
  renderAvatar,
  viewingUserPlaylistsCount,
  viewingUserFollowers,
  viewingUserFollowing,
  toggleFollowUser,
  isFollowingSelectedUser,
  isFollowersModalOpen,
  setIsFollowersModalOpen,
  followersCount,
  followersList,
  removeFollowerFromList,
  isFollowingModalOpen,
  setIsFollowingModalOpen,
  followingCount,
  followingList,
  unfollowFromList,
  isFullScreenSearch,
  setIsFullScreenSearch,
  trendSongs,
  playSong,
  renderSongMenuButton,
  isMenuOpen,
  setIsMenuOpen,
  selectedSongForMenu,
  currentTrack,
  setSongToAddToPlaylist,
  setIsAddToPlaylistOpen,
  toggleLikeSong,
  isSongLiked,
  setToastMessage,
  isAddToPlaylistOpen,
  setIsCreatePlaylistOpen,
  playlists,
  addSongToPlaylist,
  isCreatePlaylistOpen,
  handleCreatePlaylist,
  newPlaylistName,
  setNewPlaylistName,
  isCollaborativePlaylist,
  setIsCollaborativePlaylist,
  collaboratorUsername,
  setCollaboratorUsername
}: ModalsProps) {
  return (
    <>
      {/* --- MODAL: VIEW OTHER USER PROFILE CARD --- */}
      {viewingProfileCard && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setViewingProfileCard(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-[#121212] border border-white/10 w-full max-w-sm rounded-3xl overflow-hidden flex flex-col items-center text-center shadow-2xl relative pb-6">
            <div className="w-full h-32 relative bg-gray-900">
              {viewingProfileCard.cover_pic ? (
                <img src={viewingProfileCard.cover_pic} className="w-full h-full object-cover scale-105" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-900 via-gray-800 to-black" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121212]" />
              <button onClick={() => setViewingProfileCard(null)} className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-1.5 hover:bg-black transition-colors z-20">✕</button>
            </div>

            <div className="-mt-12 relative z-10 flex flex-col items-center px-6 w-full">
              <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden mb-2 border-2 border-white/20 shadow-xl flex items-center justify-center">
                {renderAvatar("w-20 h-20 text-xl font-bold", viewingProfileCard.profile_pic, viewingProfileCard.username)}
              </div>
              
              <h3 className="text-lg font-bold text-white mb-0.5">@{viewingProfileCard.username}</h3>
              <p className="text-[11px] font-mono text-gray-400 mb-2">ID: {viewingProfileCard.numeric_id || viewingProfileCard.id}</p>

              <p className="text-xs text-gray-300 text-center italic bg-white/5 px-3 py-2 rounded-xl border border-white/5 w-full mb-4">
                &ldquo;{viewingProfileCard.bio || 'Music lover & Vibe enthusiast.'}&rdquo;
              </p>

              <div className="grid grid-cols-3 gap-2 w-full bg-white/5 border border-white/10 rounded-2xl p-3 mb-5 text-center">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">{viewingUserPlaylistsCount}</span>
                  <span className="text-[9px] text-gray-400 uppercase tracking-wide">Playlists</span>
                </div>
                <div className="flex flex-col border-l border-white/10">
                  <span className="text-sm font-bold text-white">{viewingUserFollowers}</span>
                  <span className="text-[9px] text-gray-400 uppercase tracking-wide">Followers</span>
                </div>
                <div className="flex flex-col border-l border-white/10">
                  <span className="text-sm font-bold text-white">{viewingUserFollowing}</span>
                  <span className="text-[9px] text-gray-400 uppercase tracking-wide">Following</span>
                </div>
              </div>

              <button 
                onClick={toggleFollowUser}
                className={`w-full py-3 rounded-full font-bold text-xs transition-colors shadow-lg ${isFollowingSelectedUser ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-white text-black hover:bg-gray-200'}`}
              >
                {isFollowingSelectedUser ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: FOLLOWERS LIST --- */}
      {isFollowersModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsFollowersModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-[#1c1c1c] border border-white/10 w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-lg font-bold">Daftar Followers ({followersCount})</h3>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {followersList.length > 0 ? (
                followersList.map((usr: any) => (
                  <div key={usr.id} className="flex items-center justify-between gap-3 p-2 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center font-bold text-xs">
                        {usr.profile_pic ? <img src={usr.profile_pic} className="w-full h-full object-cover" /> : usr.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">@{usr.username}</h4>
                        <p className="text-[10px] font-mono text-gray-400">ID: {usr.numeric_id || usr.id}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFollowerFromList(String(usr.numeric_id || usr.id));
                      }}
                      className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-500/15 text-red-300 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">Belum ada followers.</p>
              )}
            </div>
            <button onClick={() => setIsFollowersModalOpen(false)} className="w-full py-2.5 bg-[#2a2a2a] rounded-xl text-xs font-semibold">Tutup</button>
          </div>
        </div>
      )}

      {/* --- MODAL: FOLLOWING LIST --- */}
      {isFollowingModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsFollowingModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-[#1c1c1c] border border-white/10 w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-lg font-bold">Daftar Following ({followingCount})</h3>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {followingList.length > 0 ? (
                followingList.map((usr: any) => (
                  <div key={usr.id} className="flex items-center justify-between gap-3 p-2 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center font-bold text-xs">
                        {usr.profile_pic ? <img src={usr.profile_pic} className="w-full h-full object-cover" /> : usr.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">@{usr.username}</h4>
                        <p className="text-[10px] font-mono text-gray-400">ID: {usr.numeric_id || usr.id}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        unfollowFromList(String(usr.numeric_id || usr.id));
                      }}
                      className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-500/15 text-red-300 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Unfollow
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">Anda belum mengikuti siapapun.</p>
              )}
            </div>
            <button onClick={() => setIsFollowingModalOpen(false)} className="w-full py-2.5 bg-[#2a2a2a] rounded-xl text-xs font-semibold">Tutup</button>
          </div>
        </div>
      )}

      {/* --- MODAL: FULL SCREEN SEARCH TRENDING --- */}
      {isFullScreenSearch && (
        <div className="fixed inset-0 z-[110] bg-black text-white flex flex-col p-4 overflow-y-auto animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Trending & Viral Songs</h2>
            <button 
              onClick={() => setIsFullScreenSearch(false)}
              className="text-xs font-bold px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full"
            >
              Kembali
            </button>
          </div>

          <div className="flex flex-col gap-2 pb-20">
            {trendSongs.map((song: any, idx: number) => (
              <div 
                key={idx} 
                onClick={() => { playSong(song, trendSongs, idx); setIsFullScreenSearch(false); }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold text-white truncate">{song.title}</span>
                    <span className="text-xs text-gray-400 truncate">{song.artists?.map((a: any) => a.name).join(', ')}</span>
                  </div>
                </div>
                {renderSongMenuButton(song)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODAL TITIK TIGA (OPSI LAGU) --- */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-sm flex items-end justify-center animate-fade-in" onClick={() => setIsMenuOpen(false)}>
          <div className="bg-[#242424] w-full max-w-md rounded-t-2xl p-6 flex flex-col gap-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-2"></div>
            
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-12 h-12 bg-black rounded overflow-hidden flex-shrink-0">
                {(selectedSongForMenu || currentTrack)?.thumbnails?.[0]?.url && (
                  <img src={(selectedSongForMenu || currentTrack).thumbnails[0].url} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-white text-base truncate">{(selectedSongForMenu || currentTrack)?.title}</span>
                <span className="text-xs text-gray-400 truncate">{(selectedSongForMenu || currentTrack)?.artists?.map((a:any)=>a.name).join(', ')}</span>
              </div>
            </div>

            <button onClick={() => { setSongToAddToPlaylist(selectedSongForMenu || currentTrack); setIsAddToPlaylistOpen(true); setIsMenuOpen(false); }} className="flex items-center gap-4 py-3 text-white font-medium hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span>Tambahkan ke Playlist...</span>
            </button>

            <button onClick={() => { toggleLikeSong(selectedSongForMenu || currentTrack); setIsMenuOpen(false); }} className="flex items-center gap-4 py-3 text-white font-medium hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              <span>{isSongLiked((selectedSongForMenu || currentTrack)?.videoId) ? 'Hapus dari Liked Songs' : 'Sukai Lagu Ini (Like)'}</span>
            </button>

            <button onClick={() => {
              if (navigator.share) {
                navigator.share({ title: (selectedSongForMenu || currentTrack)?.title, url: window.location.href });
              } else {
                setToastMessage("Tautan lagu tersalin ke clipboard!");
              }
              setIsMenuOpen(false);
            }} className="flex items-center gap-4 py-3 text-white font-medium hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
              <span>Bagikan (Share)</span>
            </button>

            <button onClick={() => setIsMenuOpen(false)} className="mt-2 w-full py-3 bg-[#333] rounded-full font-semibold text-center text-white">Tutup</button>
          </div>
        </div>
      )}

      {/* --- MODAL ADD TO PLAYLIST --- */}
      {isAddToPlaylistOpen && (
        <div className="fixed inset-0 z-[140] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsAddToPlaylistOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-[#1c1c1c] border border-white/10 w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-lg font-bold">Tambah ke Playlist</h3>
            
            <button 
              onClick={() => setIsCreatePlaylistOpen(true)}
              className="w-full py-3 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <span>+ Create a Playlist</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-[10px] uppercase">Atau pilih playlist</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {playlists.length > 0 ? (
                playlists.map((pl) => (
                  <div key={pl.id} onClick={() => addSongToPlaylist(pl.id)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer flex justify-between items-center text-sm font-medium">
                    <span>{pl.name} {pl.isCollaborative && '🤝'}</span>
                    <span className="text-xs text-gray-400">{pl.songs.length} lagu</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">Belum ada playlist.</p>
              )}
            </div>
            <button onClick={() => setIsAddToPlaylistOpen(false)} className="w-full py-2.5 bg-[#2a2a2a] text-gray-300 font-semibold rounded-xl text-xs mt-1">Tutup</button>
          </div>
        </div>
      )}

      {/* --- MODAL CREATE PLAYLIST --- */}
      {isCreatePlaylistOpen && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsCreatePlaylistOpen(false)}>
          <form onSubmit={handleCreatePlaylist} onClick={(e) => e.stopPropagation()} className="bg-[#1c1c1c] border border-white/10 w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-lg font-bold">Buat Playlist Baru</h3>
            <input 
              type="text" 
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Nama playlist (mis: Vibes Chill 2026)"
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white"
              autoFocus
            />

            <div className="flex flex-col gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input 
                  type="checkbox
