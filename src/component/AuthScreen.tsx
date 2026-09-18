'use client';

import React from 'react';

interface AuthScreenProps {
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  authInput: string;
  setAuthInput: (val: string) => void;
  authPassword: string;
  setAuthPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  handleAuthSubmit: (e: React.FormEvent) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  authMode,
  setAuthMode,
  authInput,
  setAuthInput,
  authPassword,
  setAuthPassword,
  showPassword,
  setShowPassword,
  authError,
  setAuthError,
  handleAuthSubmit,
}) => {
  return (
    <div className="bg-black min-h-screen text-white flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-sm bg-[#121212] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">ICARUS</h1>
          <p className="text-xs text-gray-400">Your Ultimate Vibe & Music Space</p>
        </div>

        <div className="flex bg-black/50 p-1 rounded-xl mb-6 border border-white/5">
          <button 
            onClick={() => { setAuthMode('login'); setAuthError(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${authMode === 'login' ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Masuk
          </button>
          <button 
            onClick={() => { setAuthMode('register'); setAuthError(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${authMode === 'register' ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Daftar
          </button>
        </div>

        {authError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-4 text-center">
            {authError}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Email Akun / Nomor Telpon</label>
            <input 
              type="text" 
              value={authInput}
              onChange={(e) => setAuthInput(e.target.value)}
              placeholder="nama@email.com / 08123456789"
              className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white focus:outline-none focus:border-white transition-colors"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="w-full mt-2 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-transform active:scale-[0.98]">
            {authMode === 'login' ? 'Masuk' : 'Daftar Akun'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;
