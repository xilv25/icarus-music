'use client';

import React from 'react';

interface FollowUser {
  id: string | number;
  numeric_id?: string | number;
  username?: string;
  profile_pic?: string;
}

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  count: number;
  list: FollowUser[];
  type: 'followers' | 'following';
  onAction: (id: string) => void;
  emptyText: string;
}

export default function FollowListModal({
  isOpen,
  onClose,
  title,
  count,
  list,
  type,
  onAction,
  emptyText,
}: FollowListModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" 
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-[#1c1c1c] border border-white/10 w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl"
      >
        <h3 className="text-lg font-bold text-white">
          {title} ({count})
        </h3>
        
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto scrollbar-none">
          {list.length > 0 ? (
            list.map((usr: FollowUser) => {
              const identifier = String(usr.numeric_id || usr.id);
              return (
                <div
                  key={usr.id}
                  className="flex items-center justify-between gap-3 p-2 bg-white/5 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center font-bold text-xs text-white">
                      {usr.profile_pic ? (
                        <img 
                          src={usr.profile_pic} 
                          alt={usr.username || 'User'} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        usr.username?.[0]?.toUpperCase() || 'U'
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">@{usr.username || 'user'}</h4>
                      <p className="text-[10px] font-mono text-gray-400">ID: {identifier}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction(identifier);
                    }}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500/15 text-red-300 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                  >
                    {type === 'followers' ? 'Hapus' : 'Unfollow'}
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">{emptyText}</p>
          )}
        </div>

        <button 
          onClick={onClose} 
          className="w-full py-2.5 bg-[#2a2a2a] hover:bg-[#333] transition-colors rounded-xl text-xs font-semibold text-white"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
