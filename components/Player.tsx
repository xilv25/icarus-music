// components/Player.tsx
'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, Heart } from 'lucide-react';
import ReactPlayer from 'react-player/youtube';

interface PlayerProps {
  currentSong: any;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  progress: number;
  duration: number;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  volume: number;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenFullPlayer: () => void;
  isLiked: boolean;
  onToggleLike: () => void;
}

export default function Player({
  currentSong,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  progress,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  onOpenFullPlayer,
  isLiked,
  onToggleLike,
}: PlayerProps) {
  if (!currentSong) return null;

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-3 flex items-center justify-between z-40 shadow-2xl">
      {/* Hidden React Player for YouTube Audio/Video stream */}
      <div className="hidden">
        <ReactPlayer
          url={currentSong.url || `https://www.youtube.com/watch?v=${currentSong.youtubeId}`}
          playing={isPlaying}
          volume={volume}
          progressInterval={1000}
          onProgress={({ playedSeconds }) => {
            // progress handler state logic passed from parent if needed
          }}
          onEnded={onNext}
        />
      </div>

      {/* Song Info */}
      <div className="flex items-center gap-3 w-1/4 min-w-[150px]">
        <img
          src={currentSong.thumbnail || '/default-album.png'}
          alt={currentSong.title}
          className="w-12 h-12 rounded object-cover cursor-pointer"
          onClick={onOpenFullPlayer}
        />
        <div className="overflow-hidden cursor-pointer" onClick={onOpenFullPlayer}>
          <h4 className="text-white text-sm font-semibold truncate hover:underline">
            {currentSong.title}
          </h4>
          <p className="text-zinc-400 text-xs truncate">{currentSong.artist}</p>
        </div>
        <button
          onClick={onToggleLike}
          className={`text-zinc-400 hover:text-white transition-colors ml-2 ${
            isLiked ? 'text-green-500 hover:text-green-400' : ''
          }`}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Player Controls & Progress */}
      <div className="flex flex-col items-center gap-1 w-2/4 max-w-md">
        <div className="flex items-center gap-4">
          <button onClick={onPrev} className="text-zinc-400 hover:text-white transition-colors">
            <SkipBack size={20} />
          </button>
          <button
            onClick={onPlayPause}
            className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" className="ml-0.5" />}
          </button>
          <button onClick={onNext} className="text-zinc-400 hover:text-white transition-colors">
            <SkipForward size={20} />
          </button>
        </div>

        <div className="w-full flex items-center gap-2 text-xs text-zinc-400">
          <span>{Math.floor(progress / 60)}:{Math.floor(progress % 60).toString().padStart(2, '0')}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={onSeek}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
          />
          <span>{Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>

      {/* Extra Controls & Volume */}
      <div className="flex items-center justify-end gap-3 w-1/4">
        <div className="hidden md:flex items-center gap-2">
          <Volume2 size={18} className="text-zinc-400" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={onVolumeChange}
            className="w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>
        <button onClick={onOpenFullPlayer} className="text-zinc-400 hover:text-white transition-colors">
          <Maximize2 size={18} />
        </button>
      </div>
    </div>
  );
          }
