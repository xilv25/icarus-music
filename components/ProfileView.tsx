// components/ProfileView.tsx
'use client';

import React from 'react';
import { Settings, ShieldCheck, Users, Music, LogOut } from 'lucide-react';

interface ProfileViewProps {
  user: any;
  onOpenEditProfile: () => void;
  onOpenFollowers: () => void;
  onOpenFollowing: () => void;
  onLogout: () => void;
  followersCount: number;
  followingCount: number;
}

export default function ProfileView({
  user,
  onOpenEditProfile,
  onOpenFollowers,
  onOpenFollowing,
  onLogout,
  followersCount,
  followingCount,
}: ProfileViewProps) {
  if (!user) return null;

  return (
    <div className="w-full pb-28">
      {/* Cover Banner */}
      <div className="h-48 md:h-64 w-full bg-gradient-to-r from-zinc-800 via-zinc-900 to-black relative">
        {user.cover_url && (
          <img src={user.cover_url} alt="Cover" className="w-full h-full object-cover opacity-60" />
        )}
      </div>

      {/* Profile Details Container */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 relative -mt-16 md:-mt-20 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <img
              src={user.avatar_url || '/default-avatar.png'}
              alt={user.username}
              className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-zinc-950 object-cover shadow-xl bg-zinc-900"
            />
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{user.username || 'User Icarus'}</h1>
                {user.is_verified && <ShieldCheck size={20} className="text-blue-400 fill-blue-400/20" />}
              </div>
              <p className="text-zinc-400 text-xs mt-1">ID Angka: <span className="text-zinc-200 font-mono">#{user.numeric_id || '------'}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={onOpenEditProfile}
              className="flex-1 md:flex-none px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Settings size={14} /> Edit Profil
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-red-500/20"
            >
              <LogOut size={14} /> Keluar
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-300 text-sm whitespace-pre-wrap">{user.bio || 'Belum ada bio.'}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={onOpenFollowers}
            className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors"
          >
            <div>
              <p className="text-zinc-400 text-xs">Followers</p>
              <p className="text-xl font-bold text-white mt-0.5">{followersCount}</p>
            </div>
            <Users size={20} className="text-zinc-500" />
          </div>

          <div
            onClick={onOpenFollowing}
            className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors"
          >
            <div>
              <p className="text-zinc-400 text-xs">Following</p>
              <p className="text-xl font-bold text-white mt-0.5">{followingCount}</p>
            </div>
            <Users size={20} className="text-zinc-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
