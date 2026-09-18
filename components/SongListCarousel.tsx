import React from 'react';

const chunkArray = (arr: any[], size: number) => {
  const chunked = [];
  for (let i = 0; i < arr.length; i += size) {
    chunked.push(arr.slice(i, i + size));
  }
  return chunked;
};

interface SongListCarouselProps {
  title: string;
  subtitle?: string;
  songs: any[];
  onShowAll?: () => void;
  onSongSelect?: (song: any, index: number) => void;
  currentTrack?: any;
  isPlaying?: boolean;
  playSong?: (song: any, queue: any[], index: number) => void;
  toggleLikeSong?: (song: any, e?: React.MouseEvent) => void;
  isSongLiked?: (videoId: string) => boolean;
  isSongPlayedBefore?: (videoId: string) => boolean;
  renderSongMenuButton?: (song: any, e?: React.MouseEvent) => React.ReactNode;
  isRecentlyPlayed?: boolean;
}

export default function SongListCarousel({
  title,
  subtitle,
  songs,
  onShowAll,
  onSongSelect,
  currentTrack,
  isPlaying = false,
  playSong,
  toggleLikeSong,
  isSongLiked,
  isSongPlayedBefore,
  renderSongMenuButton,
  isRecentlyPlayed = false,
}: SongListCarouselProps) {
  const columns = chunkArray(songs, 5);

  if (!songs || songs.length === 0) return null;

  const handleSongClick = (song: any, globalIdx: number) => {
    if (onSongSelect) {
      onSongSelect(song, globalIdx);
    } else if (playSong) {
      playSong(song, songs, globalIdx);
    }
  };

  return (
    <section className="mt-2">
      <div className="flex justify-between items-center mb-4">
        <div>
          {subtitle && <p className="text-xs text-gray-400 mb-0.5">{subtitle}</p>}
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        </div>
        {onShowAll && (
          <button 
            onClick={onShowAll}
            className="text-xs font-semibold text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
          >
            Show All
          </button>
        )}
      </div>

      <div className="flex overflow-x-auto gap-4 pb-2 snap-x scrollbar-none pr-12">
        {columns.map((column, colIdx) => (
          <div 
            key={colIdx} 
            className="flex flex-col gap-2 min-w-[330px] max-w-[350px] flex-shrink-0 snap-start bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 shadow-lg"
          >
            {column.map((song: any, songIdx: number) => {
              const globalIdx = colIdx * 5 + songIdx;
              const artistName = song.artists?.map((a: any) => a.name).join(', ') || '';
              const liked = isSongLiked ? isSongLiked(song.videoId) : false;
              const playedBefore = isSongPlayedBefore ? isSongPlayedBefore(song.videoId) : false;
              const isCurrent = currentTrack?.videoId === song.videoId;

              return (
                <div 
                  key={songIdx} 
                  onClick={() => handleSongClick(song, globalIdx)} 
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden relative shadow-inner">
                      {song.thumbnails?.[0]?.url && (
                        <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />
                      )}
                      {isCurrent && isPlaying && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-base font-medium truncate w-32 ${isCurrent ? 'text-green-400 font-bold' : 'text-white'}`}>
                          {song.title}
                        </span>
                        {!isRecentlyPlayed && playedBefore && (
                          <span className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center text-[10px] text-white flex-shrink-0" title="Pernah diputar">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-400 truncate w-36">{artistName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isRecentlyPlayed ? (
                      <span className="w-6 h-6 rounded-full bg-gray-700/60 text-gray-400 flex items-center justify-center text-xs font-bold" title="Pernah diputar">
                        ✓
                      </span>
                    ) : (
                      toggleLikeSong && (
                        <button onClick={(e) => toggleLikeSong(song, e)} className="p-1">
                          {liked ? (
                            <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                          )}
                        </button>
                      )
                    )}
                    {renderSongMenuButton && renderSongMenuButton(song)}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
