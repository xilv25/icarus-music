// components/FollowersModal.tsx
'use client';

import React from 'react';
import { X, UserMinus, ShieldCheck } from 'lucide-react';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  usersList: any[];
  onActionUser?: (user: any) => void;
  actionLabel?: string;
}

export default function FollowersModal({
  isOpen,
  onClose,
  title,
  usersList,
  onActionUser,
  actionLabel = 'Hapus',
}: FollowersModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
          {usersList.length === 0 ? (
            <p className="text-zinc-500 text-xs text-center py-12">Tidak ada data pengguna.</p>
          ) : (
            usersList.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-xl bg-zinc-800/40 border border-zinc-800 hover:bg-zinc-800/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.avatar_url || '/default-avatar.png'}
                    alt={item.username}
                    className="w-10 h-10 rounded-full object-cover bg-zinc-800"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-white text-sm font-semibold">{item.username}</p>
                      {item.is_verified && <ShieldCheck size={14} className="text-blue-400 fill-blue-400/20" />}
                    </div>
                    <p className="text-zinc-400 text-[10px]">#{item.numeric_id}</p>
                  </div>
                </div>

                {onActionUser && (
                  <button
                    onClick={() => onActionUser(item)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 rounded-lg text-xs font-medium transition-colors border border-zinc-700/50 hover:border-red-500/30 flex items-center gap-1"
                  >
                    <UserMinus size={12} /> {actionLabel}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
