'use client';

import React from 'react';

interface UserCardModalProps {
  viewingProfileCard: any;
  onClose: () => void;
  renderAvatar: (customClass?: string, overridePic?: string, overrideUsername?: string) => React.ReactNode;
  viewingUserPlaylistsCount: number;
  viewingUserFollowers: number;
  viewingUserFollowing: number;
  isFollowingSelectedUser: boolean;
  toggleFollowUser: () => void;
}

export default function UserCardModal({
  viewingProfileCard,
  onClose,
  renderAvatar,
  viewingUserPlaylistsCount,
  viewingUserFollowers,
  viewingUserFollowing,
  isFollowingSelectedUser,
  toggleFollowUser,
}: UserCardModalProps) {
  if (!viewingProfileCard) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" 
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-[#121212] border border-white/10 w-full max-w-sm rounded-3xl overflow-hidden flex flex-col items-center text-center shadow-2xl relative pb-6"
      >
        
        {/* Header Cover Banner */}
        <div className="w-full h-32 relative bg-gray-900">
          {viewingProfileCard.cover_pic ? (
            <img src={viewingProfileCard.cover_pic} alt="Cover" className="w-full h-full object-cover scale-105" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-900 via-gray-800 to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121212]" />
          <button 
            onClick={onClose} 
            className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-1.5 hover:bg-black transition-colors z-20"
          >
            ✕
          </button>
        </div>

        {/* Avatar & Identitas */}
        <div className="-mt-12 relative z-10 flex flex-col items-center px-6 w-full">
          <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden mb-2 border-2 border-white/20 shadow-xl flex items-center justify-center">
            {renderAvatar("w-20 h-20 text-xl font-bold", viewingProfileCard.profile_pic, viewingProfileCard.username)}
          </div>
          
          <h3 className="text-lg font-bold text-white mb-0.5">@{viewingProfileCard.username}</h3>
          <p className="text-[11px] font-mono text-gray-400 mb-2">ID: {viewingProfileCard.numeric_id || viewingProfileCard.id}</p>

          {/* Bio User */}
          <p className="text-xs text-gray-300 text-center italic bg-white/5 px-3 py-2 rounded-xl border border-white/5 w-full mb-4">
            &ldquo;{viewingProfileCard.bio || 'Music lover & Vibe enthusiast.'}&rdquo;
          </p>

          {/* Stats Card User Lain (Playlists, Followers, Following) - Tanpa Email! */}
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

          {/* Tombol Follow / Unfollow */}
          <button 
            onClick={toggleFollowUser}
            className={`w-full py-3 rounded-full font-bold text-xs transition-colors shadow-lg ${
              isFollowingSelectedUser 
                ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' 
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            {isFollowingSelectedUser ? 'Unfollow' : 'Follow'}
          </button>
        </div>
      </div>
    </div>
  );
}
