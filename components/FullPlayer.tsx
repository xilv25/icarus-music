'use client';

import React from 'react';

interface FullPlayerProps {
  isPlayerOpen: boolean;
  setIsPlayerOpen: (isOpen: boolean) => void;
  currentTrack: any;
  isPlaying: boolean;
  isBuffering: boolean;
  togglePlay: (e?: React.MouseEvent) => void;
  handleNext: () => void;
  handlePrev: () => void;
  handleSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  playedProgress: number;
  playedSeconds: number;
  duration: number;
  formatTime: (seconds: number) => number | string;
  getHighResCover: (url?: string) => string;
  toggleLikeSong: (song: any, e?: React.MouseEvent) => void;
  isSongLiked: (videoId: string) => boolean;
  isShuffle: boolean;
  setIsShuffle: (shuffle: boolean) => void;
  isRepeat: 'off' | 'all' | 'one';
  setIsRepeat: (repeat: 'off' | 'all' | 'one') => void;
  setSelectedSongForMenu: (song: any) => void;
  setIsMenuOpen: (isOpen: boolean) => void;
  lyrics: string | null;
  isLoadingLyrics: boolean;
  isLyricsExpanded: boolean;
  setIsLyricsExpanded: (expanded: boolean) => void;
  lyricContainerRef: React.RefObject<HTMLDivElement>;
  activeLyricRef: React.RefObject<HTMLDivElement>;
  lyricLines: string[];
  activeLineIndex: number;
}

export default function FullPlayer({
  isPlayerOpen,
  setIsPlayerOpen,
  currentTrack,
  isPlaying,
  isBuffering,
  togglePlay,
  handleNext,
  handlePrev,
  handleSeek,
  playedProgress,
  playedSeconds,
  duration,
  formatTime,
  getHighResCover,
  toggleLikeSong,
  isSongLiked,
  isShuffle,
  setIsShuffle,
  isRepeat,
  setIsRepeat,
  setSelectedSongForMenu,
  setIsMenuOpen,
  isLoadingLyrics,
  isLyricsExpanded,
  setIsLyricsExpanded,
  lyricContainerRef,
  activeLyricRef,
  lyricLines,
  activeLineIndex,
}: FullPlayerProps) {
  if (!currentTrack) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] bg-gradient-to-b from-[#2a2a2a] to-black text-white flex flex-col transition-transform duration-300 ease-in-out overflow-y-auto pb-8 ${
        isPlayerOpen ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* Header Full Player */}
      <div className="flex items-center justify-between px-6 py-6 sticky top-0 bg-[#2a2a2a]/90 backdrop-blur-md z-10">
        <button onClick={() => setIsPlayerOpen(false)} className="p-2 -ml-2">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="text-center flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-gray-300">Playing from Icarus</span>
          <span className="text-xs font-bold">Start listening</span>
        </div>
        <button
          onClick={() => {
            setSelectedSongForMenu(currentTrack);
            setIsMenuOpen(true);
          }}
          className="p-2 -mr-2 text-white hover:text-gray-300"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      </div>

      {/* Konten Utama Player */}
      <div className="px-8 mt-2 flex flex-col items-center">
        {/* Cover Album */}
        <div className="w-full aspect-square bg-gray-900 shadow-2xl mb-10 overflow-hidden rounded-md max-w-md">
          {currentTrack.thumbnails?.[0]?.url && (
            <img
              src={getHighResCover(currentTrack.thumbnails[currentTrack.thumbnails.length - 1].url)}
              alt="cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Informasi Lagu & Like */}
        <div className="w-full max-w-md flex justify-between items-center mb-8">
          <div className="overflow-hidden mr-4">
            <h2 className="text-2xl font-bold truncate text-white mb-1">{currentTrack.title}</h2>
            <p className="text-gray-400 text-lg truncate">
              {currentTrack.artists?.map((a: any) => a.name).join(', ')}
            </p>
          </div>
          <button onClick={(e) => toggleLikeSong(currentTrack, e)}>
            {isSongLiked(currentTrack.videoId) ? (
              <svg className="w-7 h-7 text-white fill-white" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>
        </div>

        {/* Progress Bar & Durasi */}
        <div className="w-full max-w-md mb-6">
          <div onClick={handleSeek} className="py-2 cursor-pointer group">
            <div className="h-[6px] bg-gray-600 rounded-full w-full relative">
              <div
                className="h-full bg-white rounded-full absolute top-0 left-0 pointer-events-none"
                style={{ width: `${playedProgress * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-gray-400 mt-1">
            <span>{formatTime(playedSeconds)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Kontrol Pemutaran */}
        <div className="w-full max-w-md flex items-center justify-between mb-10 px-2">
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`transition-colors ${isShuffle ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
          <button onClick={handlePrev} className="text-white hover:text-gray-300">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
          >
            {isBuffering ? (
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button onClick={handleNext} className="text-white hover:text-gray-300">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
          <button
            onClick={() => setIsRepeat(isRepeat === 'off' ? 'all' : isRepeat === 'all' ? 'one' : 'off')}
            className={`transition-colors ${isRepeat !== 'off' ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bagian Fitur Lirik Interaktif */}
      <div className="px-6 mt-4 pb-12 max-w-md mx-auto w-full">
        <div
          className={`bg-[#181818] rounded-xl p-6 shadow-2xl transition-all duration-300 ${
            isLyricsExpanded ? 'fixed inset-4 z-50 bg-[#121212] flex flex-col max-w-none mx-0' : 'min-h-[320px] max-h-[380px] overflow-hidden relative'
          }`}
        >
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-inherit pt-1 pb-3 border-b border-white/10 z-10">
            <h3 className="text-sm font-bold tracking-wide">Lyrics</h3>
            <button
              onClick={() => setIsLyricsExpanded(!isLyricsExpanded)}
              className="bg-black/60 p-2 rounded-full hover:bg-black transition-colors"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
          <div
            ref={lyricContainerRef}
            className={`relative overflow-y-auto scrollbar-none ${isLyricsExpanded ? 'flex-1 py-4 text-2xl md:text-3xl' : 'max-h-[260px] pr-2'}`}
          >
            <div className="py-[120px] flex flex-col gap-4 text-xl font-bold">
              {isLoadingLyrics ? (
                <div className="text-gray-500 animate-pulse">Memuat lirik...</div>
              ) : lyricLines.length > 0 ? (
                lyricLines.map((line, idx) => {
                  const isActive = idx === activeLineIndex;
                  return (
                    <div
                      key={idx}
                      ref={isActive ? activeLyricRef : null}
                      className={`transition-all duration-300 ${
                        isActive ? 'text-white text-2xl md:text-3xl font-extrabold' : 'text-gray-500 text-lg opacity-60'
                      }`}
                    >
                      {line}
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 italic text-base text-center">Lirik tidak tersedia.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
        }
