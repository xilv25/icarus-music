// components/FullPlayer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, ListMusic, Mic2, Clock } from 'lucide-react';

interface FullPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: any;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  progress: number;
  duration: number;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLiked: boolean;
  onToggleLike: () => void;
  queue: any[];
  history: any[];
  onSelectSong: (song: any) => void;
}

export default function FullPlayer({
  isOpen,
  onClose,
  currentSong,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  progress,
  duration,
  onSeek,
  isLiked,
  onToggleLike,
  queue,
  history,
  onSelectSong,
}: FullPlayerProps) {
  const [activeTab, setActiveTab] = useState<'player' | 'lyrics' | 'queue' | 'history'>('player');
  const [lyrics, setLyrics] = useState<string>('Memuat lirik...');

  useEffect(() => {
    if (currentSong && activeTab === 'lyrics') {
      // Logika fetch lirik asli dari page.tsx kamu (misal: api.lyrics.ovh)
      fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(currentSong.artist)}/${encodeURIComponent(currentSong.title)}`)
        .then(res => res.json())
        .then(data => {
          if (data.lyrics) {
            setLyrics(data.lyrics);
          } else {
            setLyrics('Lirik tidak ditemukan.');
          }
        })
        .catch(() => setLyrics('Gagal memuat lirik.'));
    }
  }, [currentSong, activeTab]);

  if (!isOpen || !currentSong) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 flex flex-col justify-between p-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
        <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
          <ChevronDown size={24} />
        </button>
        <div className="flex gap-2 bg-zinc-900/80 p-1 rounded-full border border-zinc-800">
          <button
            onClick={() => setActiveTab('player')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === 'player' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Lagu
          </button>
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === 'lyrics' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Lirik
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === 'queue' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Antrean
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === 'history' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Riwayat
          </button>
        </div>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Main Content Body */}
      <div className="flex-1 flex items-center justify-center max-w-xl mx-auto w-full my-4 overflow-hidden">
        {activeTab === 'player' && (
          <div className="flex flex-col items-center text-center w-full space-y-6">
            <img
              src={currentSong.thumbnail || '/default-album.png'}
              alt={currentSong.title}
              className="w-72 h-72 md:w-96 md:h-96 rounded-2xl object-cover shadow-2xl border border-zinc-800"
            />
            <div className="w-full flex items-center justify-between px-2">
              <div className="text-left overflow-hidden">
                <h2 className="text-xl font-bold text-white truncate">{currentSong.title}</h2>
                <p className="text-zinc-400 text-sm truncate">{currentSong.artist}</p>
              </div>
              <button
                onClick={onToggleLike}
                className={`p-2 transition-colors ${isLiked ? 'text-green-500' : 'text-zinc-400 hover:text-white'}`}
              >
                <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'lyrics' && (
          <div className="w-full h-full overflow-y-auto text-center px-4 py-8 space-y-4 custom-scrollbar">
            <h3 className="text-lg font-bold text-white mb-4">{currentSong.title}</h3>
            <pre className="text-zinc-300 font-sans whitespace-pre-wrap leading-relaxed text-sm">
              {lyrics}
            </pre>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="w-full h-full overflow-y-auto px-2 space-y-2">
            <h3 className="text-sm font-bold text-zinc-400 mb-3 flex items-center gap-2">
              <ListMusic size={16} /> Antrean Musik Berikutnya
            </h3>
            {queue.length === 0 ? (
              <p className="text-zinc-500 text-xs text-center py-10">Antrean kosong.</p>
            ) : (
              queue.map((song, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectSong(song)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-900 cursor-pointer transition-colors"
                >
                  <img src={song.thumbnail} alt={song.title} className="w-10 h-10 rounded object-cover" />
                  <div className="overflow-hidden">
                    <p className="text-white text-sm font-medium truncate">{song.title}</p>
                    <p className="text-zinc-400 text-xs truncate">{song.artist}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="w-full h-full overflow-y-auto px-2 space-y-2">
            <h3 className="text-sm font-bold text-zinc-400 mb-3 flex items-center gap-2">
              <Clock size={16} /> Riwayat Pemutaran
            </h3>
            {history.length === 0 ? (
              <p className="text-zinc-500 text-xs text-center py-10">Belum ada riwayat pemutaran.</p>
            ) : (
              history.map((song, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectSong(song)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-900 cursor-pointer transition-colors"
                >
                  <img src={song.thumbnail} alt={song.title} className="w-10 h-10 rounded object-cover" />
                  <div className="overflow-hidden">
                    <p className="text-white text-sm font-medium truncate">{song.title}</p>
                    <p className="text-zinc-400 text-xs truncate">{song.artist}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="w-full max-w-xl mx-auto space-y-4 pb-4">
        <div className="w-full space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={onSeek}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
          />
          <div className="flex justify-between text-xs text-zinc-400">
            <span>{Math.floor(progress / 60)}:{Math.floor(progress % 60).toString().padStart(2, '0')}</span>
            <span>{Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-6">
          <button className="text-zinc-400 hover:text-white transition-colors">
            <Shuffle size={20} />
          </button>
          <button onClick={onPrev} className="text-zinc-400 hover:text-white transition-colors">
            <SkipBack size={28} />
          </button>
          <button
            onClick={onPlayPause}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
          >
            {isPlaying ? <Pause size={28} fill="black" /> : <Play size={28} fill="black" className="ml-1" />}
          </button>
          <button onClick={onNext} className="text-zinc-400 hover:text-white transition-colors">
            <SkipForward size={28} />
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <Repeat size={20} />
          </button>
        </div>
      </div>
    </div>
  );
        }
      
