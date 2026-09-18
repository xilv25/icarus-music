'use client';

import React from 'react';

interface ProfileModalProps {
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  currentUser: any;
  userPhone: string;
  setUserPhone: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  profileMsg: string | null;
  handleProfileUpdate: (e: React.FormEvent) => void;
  handleLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isProfileOpen,
  setIsProfileOpen,
  currentUser,
  userPhone,
  setUserPhone,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  profileMsg,
  handleProfileUpdate,
  handleLogout,
}) => {
  if (!isProfileOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        <button
          onClick={() => setIsProfileOpen(false)}
          className="absolute right-5 top-5 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-3xl font-extrabold text-white mb-3 shadow-lg">
            {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 className="text-lg font-bold text-white truncate max-w-full">
            {currentUser?.email || 'Pengguna'}
          </h2>
          <span className="text-xs text-gray-400 mt-0.5">Pengaturan Akun</span>
        </div>

        {profileMsg && (
          <div className="bg-white/10 border border-white/20 text-white text-xs p-3 rounded-xl mb-4 text-center">
            {profileMsg}
          </div>
        )}

        <form onSubmit={handleProfileUpdate} className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Nomor Telepon</label>
            <input
              type="text"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              placeholder="08123456789"
              className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Password Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Biarkan kosong jika tak diubah"
              className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 bg-white text-black font-bold rounded-xl text-xs hover:bg-gray-200 transition-colors"
          >
            Simpan Perubahan
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-center">
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-red-400 hover:text-red-300 font-semibold transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Keluar dari Akun
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
