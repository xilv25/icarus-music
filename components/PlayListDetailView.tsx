'use client';

import React from 'react';

interface PlaylistDetailViewProps {
  activePlaylistView?: any;
  playlist?: any;
  onBack: () => void;
  onPlaySong?: (song: any, index: number) => void;
  onRemoveSong?: (videoId: string, e?: React.MouseEvent) => void;
  onDeletePlaylist?: (playlistId?: string) => void;
  onToggleLike?: (song: any, e?: React.MouseEvent) => void;
  isSongLiked?: (videoId: string) => boolean;
  onOpenMenu?: (song: any, e?: React.MouseEvent) => void;
  currentTrack?: any;
  isPlaying?: boolean;
  username?: string;
}

export default function PlayListDetailView({
  activePlaylistView,
  playlist,
  onBack,
  onPlaySong,
  onRemoveSong,
  onDeletePlaylist,
  onToggleLike,
  isSongLiked,
  onOpenMenu,
  currentTrack,
  isPlaying = false,
  username = '',
}: PlaylistDetailViewProps) {
  
  const currentPlaylist = playlist || activePlaylistView || {};

  const getContributorStats = (pl: any) => {
    if (!pl?.songs || pl.songs.length === 0) return [];
    const counts: { [key: string]: number } = {};
    const total = pl.songs.length;
    pl.songs.forEach((song: any) => {
      const u = pl.addedBy?.[song.videoId] || username || 'Owner';
      counts[u] = (counts[u] || 0) + 1;
    });
    return Object.keys(counts).map(user => ({
      user,
      percentage: Math.round((counts[user] / total) * 100),
    }));
  };

  // Cek apakah ini playlist Liked Songs
  const isLikedView = 
    currentPlaylist?.id === 'liked' || 
    currentPlaylist?.isLikedSongs || 
    currentPlaylist?.name === 'Liked Songs' || 
    currentPlaylist?.name === 'Lagu yang Disukai';

  const songsList = currentPlaylist?.songs || [];

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-20">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack} 
          className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1 w-fit transition-colors cursor-pointer"
        >
          ← Kembali ke Library
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-b from-gray-800 to-black p-6 rounded-2xl mb-2 flex flex-col justify-end gap-3 shadow-xl">
        {/* Baris Atas: Label Tipe Playlist & Tombol Hapus Playlist (Sejajar) */}
        <div className="flex items-center justify-between w-full">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
            {isLikedView 
              ? 'Playlist Spesial' 
              : currentPlaylist.isCollaborative 
                ? 'Collaborative Playlist' 
                : 'Playlist Pribadi'}
          </span>

          {/* Tombol Hapus Playlist (Hanya untuk Playlist Pribadi / Kolaborasi) */}
          {!isLikedView && onDeletePlaylist && (
            <button
              type="button"
              onClick={() => onDeletePlaylist(currentPlaylist.id)}
              className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              Hapus Playlist
            </button>
          )}
        </div>

        <div>
          <h2 className="text-3xl font-black mt-1 mb-1 text-white">{currentPlaylist.name || 'Playlist'}</h2>
          <p className="text-xs text-gray-400">{songsList.length} lagu di dalam playlist ini</p>
        </div>

        {/* Info Kontributor Playlist Kolaborasi */}
        {currentPlaylist.isCollaborative && (
          <div className="flex flex-col gap-1.5 mt-2 bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <span className="text-[11px] text-purple-300 font-bold flex items-center gap-1">
              Collaborative Playlist (Shared with @{currentPlaylist.collaborator || 'Friend'})
            </span>
            <div className="flex flex-wrap gap-2 text-[10px] text-gray-300 mt-1">
              {getContributorStats(currentPlaylist).map((stat: any, sIdx: number) => (
                <span key={sIdx} className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 font-medium">
                  {stat.user}: {stat.percentage}% kontribusi
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Songs List */}
      <div className="flex flex-col gap-1">
        {songsList.length > 0 ? (
          songsList.map((song: any, idx: number) => {
            const liked = isSongLiked ? isSongLiked(song.videoId) : false;
            const isCurrent = currentTrack?.videoId === song.videoId;
            const addedByUser = currentPlaylist.addedBy?.[song.videoId];

            return (
              <div 
                key={song.videoId || idx} 
                onClick={() => onPlaySong && onPlaySong(song, idx)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden relative shadow-inner">
                    {song.thumbnails?.[0]?.url && (
                      <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />
                    )}
                    {isCurrent && isPlaying && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className={`text-sm font-semibold truncate ${isCurrent ? 'text-green-400 font-bold' : 'text-white'}`}>
                      {song.title}
                    </span>
                    <span className="text-xs text-gray-400 truncate">
                      {song.artists?.map((a: any) => a.name).join(', ')}
                    </span>
                    
                    {/* Badge Glassmorphism Rapi "Ditambahkan oleh @..." */}
                    {addedByUser && (
                      <div className="mt-1">
                        <span className="text-[10px] text-gray-300 bg-white/10 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full inline-block font-medium">
                          Ditambahkan oleh @{addedByUser}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Tampilan Khusus Liked Songs: Tombol Love Putih untuk un-like */}
                  {isLikedView ? (
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleLike) onToggleLike(song, e);
                        else if (onRemoveSong) onRemoveSong(song.videoId, e);
                      }} 
                      className="p-1.5 text-white hover:scale-110 transition-transform cursor-pointer"
                      title="Hapus dari Lagu yang Disukai"
                    >
                      <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </button>
                  ) : (
                    /* Tampilan Playlist Biasa / Kolaborasi */
                    <>
                      {onToggleLike && (
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLike(song, e);
                          }} 
                          className="p-1.5 cursor-pointer"
                        >
                          {liked ? (
                            <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            </svg>
                          )}
                        </button>
                      )}

                      {onRemoveSong && (
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveSong(song.videoId, e);
                          }}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500/15 text-red-300 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                          title="Hapus dari playlist"
                        >
                          Hapus
                        </button>
                      )}
                    </>
                  )}

                  {onOpenMenu && (
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMenu(song, e);
                      }}
                      className="p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                      title="Opsi Lagu"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-gray-400 text-center py-10">Playlist ini masih kosong.</p>
        )}
      </div>
    </div>
  );
        }
