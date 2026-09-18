'use client';

import React from 'react';

interface ProfileViewProps {
  username: string;
  userEmail: string;
  userId: string;
  bio: string;
  isVerified: boolean;
  profilePic: string;
  coverPic: string;
  followersCount: number;
  followingCount: number;
  likedSongsList: any[];
  playlists: any[];
  isEditingProfile: boolean;
  setIsEditingProfile: (val: boolean) => void;
  tempUsername: string;
  setTempUsername: (val: string) => void;
  tempBio: string;
  setTempBio: (val: string) => void;
  tempProfilePic: string;
  setTempProfilePic: (val: string) => void;
  tempCoverPic: string;
  setTempCoverPic: (val: string) => void;
  isSavingProfile: boolean;
  handleSaveProfile: (e: React.FormEvent) => void;
  handleDeviceFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    previewSetter: (value: string) => void,
    fileSetter: (file: File | null) => void
  ) => void;
  setProfilePicFile: (file: File | null) => void;
  setCoverPicFile: (file: File | null) => void;
  renderAvatar: (customClass?: string, overridePic?: string, overrideUsername?: string) => React.ReactNode;
  setIsFollowersModalOpen: (val: boolean) => void;
  setIsFollowingModalOpen: (val: boolean) => void;
  handleLogout: () => void;
}

export default function ProfileView({
  username,
  userEmail,
  userId,
  bio,
  isVerified,
  profilePic,
  coverPic,
  followersCount,
  followingCount,
  likedSongsList,
  playlists,
  isEditingProfile,
  setIsEditingProfile,
  tempUsername,
  setTempUsername,
  tempBio,
  setTempBio,
  setTempProfilePic,
  setTempCoverPic,
  isSavingProfile,
  handleSaveProfile,
  handleDeviceFileUpload,
  setProfilePicFile,
  setCoverPicFile,
  renderAvatar,
  setIsFollowersModalOpen,
  setIsFollowingModalOpen,
  handleLogout,
}: ProfileViewProps) {
  return (
    <div className="animate-fade-in pb-12 flex flex-col items-center">
      <div className="w-full max-w-md bg-[#121212]/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md relative pb-8">
        
        {/* Cover Banner */}
        <div className="w-full h-52 relative overflow-hidden bg-gray-900">
          {coverPic ? (
            <img src={coverPic} alt="Cover" className="w-full h-full object-cover scale-110 translate-y-2" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-950 via-gray-900 to-black scale-110 translate-y-2 opacity-90" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-[#121212]" />
        </div>

        {/* Profile Avatar */}
        <div className="px-6 flex flex-col items-center relative -mt-16 z-10">
          <div className="mb-3">
            {renderAvatar("w-24 h-24 text-2xl font-bold")}
          </div>

          <div className="flex items-center gap-1.5 mb-1">
            <h2 className="text-2xl font-bold text-white">{username || 'User Icarus'}</h2>
            {isVerified && (
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow" title="Verified Account">
                ✓
              </span>
            )}
          </div>

          {/* ID Angka Acak tersimpan di Supabase */}
          <p className="text-[11px] font-mono text-gray-400 mb-0.5">ID: {userId || '1234567890'}</p>
          <p className="text-xs text-gray-400 mb-3">{userEmail || 'user@icarus.music'}</p>

          {/* Bio Display */}
          <p className="text-xs text-gray-300 text-center max-w-xs mb-5 italic bg-white/5 px-4 py-2 rounded-xl border border-white/5">
            &ldquo;{bio}&rdquo;
          </p>

          {!isEditingProfile ? (
            <button 
              onClick={() => {
                setTempUsername(username);
                setTempProfilePic(profilePic);
                setTempCoverPic(coverPic);
                setTempBio(bio);
                setIsEditingProfile(true);
              }}
              className="bg-white text-black font-bold text-xs px-6 py-2.5 rounded-full hover:bg-gray-200 transition-transform active:scale-95 shadow-md mb-6"
            >
              Edit Profil
            </button>
          ) : (
            <form onSubmit={handleSaveProfile} className="w-full flex flex-col gap-4 bg-[#1a1a1a] border border-white/10 p-5 rounded-2xl mb-6 shadow-2xl animate-fade-in">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Edit Profil & Cloud Sync</h3>
                <button type="button" onClick={() => setIsEditingProfile(false)} className="text-xs text-gray-400 hover:text-white">Batal</button>
              </div>
              
              <div>
                <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Username</label>
                <input 
                  type="text" 
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  placeholder="Masukkan username..."
                  className="w-full bg-[#242424] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Bio</label>
                <textarea 
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  placeholder="Tulis bio singkat..."
                  className="w-full bg-[#242424] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white resize-none h-20"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Foto Profil (Device)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => handleDeviceFileUpload(e, setTempProfilePic, setProfilePicFile)}
                  className="w-full text-xs text-gray-400 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-semibold file:text-black"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Cover / Banner (Device)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => handleDeviceFileUpload(e, setTempCoverPic, setCoverPicFile)}
                  className="w-full text-xs text-gray-400 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-semibold file:text-black"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="py-2.5 bg-white text-black font-bold rounded-xl text-xs hover:bg-gray-200 transition-colors mt-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingProfile ? 'Menyimpan...' : 'Simpan ke Supabase Database'}
              </button>
            </form>
          )}

          {/* Followers & Following Stats */}
          <div className="grid grid-cols-4 gap-2 w-full bg-white/5 border border-white/10 rounded-2xl p-3 mb-6 text-center shadow-lg">
            <div className="flex flex-col">
              <span className="text-base font-bold text-white">{likedSongsList.length}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Songs</span>
            </div>
            <div className="flex flex-col border-l border-white/10">
              <span className="text-base font-bold text-white">{playlists.length}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Playlists</span>
            </div>
            <div onClick={() => setIsFollowersModalOpen(true)} className="flex flex-col border-l border-white/10 cursor-pointer hover:bg-white/5 rounded-lg py-1">
              <span className="text-base font-bold text-white">{followersCount}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Followers</span>
            </div>
            <div onClick={() => setIsFollowingModalOpen(true)} className="flex flex-col border-l border-white/10 cursor-pointer hover:bg-white/5 rounded-lg py-1">
              <span className="text-base font-bold text-white">{followingCount}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Following</span>
            </div>
          </div>

          <div className="w-full flex flex-col gap-3">
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center">
              <span className="text-sm font-medium text-gray-300">Cloud Database Sync</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                Supabase Active
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full py-3.5 bg-red-600/20 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-colors mt-2"
            >
              Keluar Akun (Logout)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
                }
