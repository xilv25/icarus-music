'use client';

import React from 'react';

interface SongMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  song?: any;
  currentTrack?: any;
  isLiked?: boolean;
  onToggleLike?: (song: any) => void;
  onAddToPlaylist?: (song: any) => void;
  onOpenAddToPlaylist?: (song: any) => void;
  onShare?: (song: any) => void;
  setToastMessage?: (msg: string) => void;
}

export default function SongMenuModal({
  isOpen,
  onClose,
  song,
  currentTrack,
  isLiked = false,
  onToggleLike,
  onAddToPlaylist,
  onOpenAddToPlaylist,
  onShare,
  setToastMessage,
}: SongMenuModalProps) {
  if (!isOpen) return null;

  const targetSong = song || currentTrack;
  const handleAddPlaylist = onAddToPlaylist || onOpenAddToPlaylist;

  const handleShare = (s: any) => {
    if (onShare) {
      onShare(s);
    } else if (s) {
      const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?v=${s.videoId}` : '';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl);
        if (setToastMessage) setToastMessage('Tautan berhasil disalin!');
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-sm flex items-end justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#242424] w-full max-w-md rounded-t-2xl p-6 flex flex-col gap-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Indikator Pegangan Atas */}
        <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-2"></div>

        {/* Header: Thumbnail & Info Lagu */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="w-12 h-12 bg-black rounded overflow-hidden flex-shrink-0">
            {targetSong?.thumbnails?.[0]?.url && (
              <img
                src={targetSong.thumbnails[0].url}
                alt="Thumbnail"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-white text-base truncate">
              {targetSong?.title}
            </span>
            <span className="text-xs text-gray-400 truncate">
              {targetSong?.artists?.map((a: any) => a.name).join(', ')}
            </span>
          </div>
        </div>

        {/* Opsi 1: Tambahkan ke Playlist */}
        {handleAddPlaylist && (
          <button
            onClick={() => handleAddPlaylist(targetSong)}
            className="flex items-center gap-4 py-3 text-white font-medium hover:text-gray-300 transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Tambahkan ke Playlist...</span>
          </button>
        )}

        {/* Opsi 2: Like / Unlike */}
        {onToggleLike && (
          <button
            onClick={() => onToggleLike(targetSong)}
            className="flex items-center gap-4 py-3 text-white font-medium hover:text-gray-300 transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>
              {isLiked ? 'Hapus dari Liked Songs' : 'Sukai Lagu Ini (Like)'}
            </span>
          </button>
        )}

        {/* Opsi 3: Bagikan (Share) */}
        <button
          onClick={() => handleShare(targetSong)}
          className="flex items-center gap-4 py-3 text-white font-medium hover:text-gray-300 transition-colors"
        >
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span>Bagikan (Share)</span>
        </button>

        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="mt-2 w-full py-3 bg-[#333] rounded-full font-semibold text-center text-white"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
