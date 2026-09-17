import React, { useState } from 'react';
import { Eye, EyeOff, X, Mail, Phone, Lock } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [authType, setAuthType] = useState('email'); // 'email' atau 'phone'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ identifier: '', password: '' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#121212] border border-white/10 w-full max-w-md rounded-2xl p-6 relative text-white shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-center mb-2">
          {isLogin ? 'Selamat Datang Kembali di Icarus' : 'Buat Akun Icarus Baru'}
        </h2>
        <p className="text-gray-400 text-center text-sm mb-6">
          {isLogin ? 'Masuk untuk menikmati musik favoritmu' : 'Daftar dan nikmati streaming tanpa batas'}
        </p>

        {/* Pilihan Metode: Email / Nomor */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-4">
          <button 
            onClick={() => setAuthType('email')} 
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${authType === 'email' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
          >
            Email
          </button>
          <button 
            onClick={() => setAuthType('phone')} 
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${authType === 'phone' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
          >
            Nomor HP
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              {authType === 'email' ? 'Alamat Email' : 'Nomor Handphone'}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400">
                {authType === 'email' ? <Mail size={18} /> : <Phone size={18} />}
              </span>
              <input 
                type={authType === 'email' ? 'email' : 'tel'} 
                placeholder={authType === 'email' ? 'nama@email.com' : '+628xxxxxxxxxx'}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-white/40"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Password (Minimal 8 Karakter)</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400"><Lock size={18} /></span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-white/40"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition">
            {isLogin ? 'Masuk' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <span className="relative bg-[#121212] px-3 text-xs text-gray-500 uppercase">Atau masuk dengan</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-2.5 rounded-xl hover:bg-white/10 transition text-sm font-medium">
            Google
          </button>
          <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-2.5 rounded-xl hover:bg-white/10 transition text-sm font-medium">
            Facebook
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-white font-semibold underline ml-1">
            {isLogin ? 'Daftar' : 'Masuk'}
          </button>
        </p>
      </div>
    </div>
  );
          }
