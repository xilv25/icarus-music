'use client';

import React from 'react';

interface YouTubeAudioPlayerProps {
  currentTrack: any;
  playerRef: React.RefObject<any>;
  setIsPlaying: (playing: boolean) => void;
  setIsBuffering: (buffering: boolean) => void;
  setPlayedProgress: (progress: number) => void;
  setPlayedSeconds: (seconds: number) => void;
  setDuration: (duration: number) => void;
  handleNext: () => void;
}

export const YouTubeAudioPlayer: React.FC<YouTubeAudioPlayerProps> = ({
  currentTrack,
  playerRef,
  setIsPlaying,
  setIsBuffering,
  setPlayedProgress,
  setPlayedSeconds,
  setDuration,
  handleNext,
}) => {
  if (!currentTrack) return null;

  return (
    <div className="hidden">
      {/* 
        Gunakan ReactPlayer / YouTube IFrame API di sini. 
        Komponen ini ditempatkan tersembunyi agar pemutaran suara tetap berjalan di latar belakang.
      */}
      <iframe
        id="yt-audio-player"
        src={`https://www.youtube.com/embed/${currentTrack.videoId}?enablejsapi=1&autoplay=1`}
        allow="autoplay"
        title="Audio Engine"
      />
    </div>
  );
};

export default YouTubeAudioPlayer;
