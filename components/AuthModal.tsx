// components/AuthModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userData: any) => void;
  supabaseClient?: any;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Logika autentikasi asli dari page.tsx kamu
      if (isLoginMode) {
        // Contoh proses login
        // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        onLoginSuccess({ email, username: email.split('@')[0] });
        onClose();
      } else {
        // Contoh proses register
        // const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
        onLoginSuccess({ email, username });
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {isLoginMode ? 'Selamat Datang di Icarus' : 'Buat Akun Icarus'}
        </h2>
        <p className="text-zinc-400 text-sm text-center mb-6">
          {isLoginMode ? 'Masuk untuk akses musik & profilmu' : 'Daftar sekarang dan nikmati musik tanpa batas'}
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Username</label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3 top-3 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username_kamu"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors text-sm mt-2 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : isLoginMode ? 'Masuk' : 'Daftar'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-400">
          {isLoginMode ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-white font-medium hover:underline ml-1"
          >
            {isLoginMode ? 'Daftar di sini' : 'Masuk'}
          </button>
        </div>
      </div>
    </div>
  );
}
