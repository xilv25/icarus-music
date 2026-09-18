'use client';

import React, { useState, useEffect, useRef } from 'react';

// Import Komponen Modular
import AuthScreen from '@/components/AuthScreen';
import Navigation from '@/components/Navigation';
import HomeView from '@/components/HomeView';
import SearchView from '@/components/SearchView';
import LibraryView from '@/components/LibraryView';
import MusicPlayer from '@/components/MusicPlayer';
import PlaylistModals from '@/components/PlaylistModals';
import ProfileModal from '@/components/ProfileModal';
import SongMenuModal from '@/components/SongMenuModal';
import YouTubeAudioPlayer from '@/components/YouTubeAudioPlayer';

export default function Home() {
  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authInput, setAuthInput] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // --- Navigation & View State ---
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'library'>('home');
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);

  // --- Player State ---
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [playedProgress, setPlayedProgress] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState<'off' | 'all' | 'one'>('off');

  // --- Lyrics State ---
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);
  const [lyricLines, setLyricLines] = useState<string[]>([]);
  const [activeLineIndex, setActiveLineIndex] = useState(0);

  // --- Library & Playlist State ---
  const [likedSongs, setLikedSongs] = useState<any[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);

  // --- Search & Discovery State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [quickPicks, setQuickPicks] = useState<any[]>([]);
  const [isLoadingQuickPicks, setIsLoadingQuickPicks] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodSongs, setMoodSongs] = useState<any[]>([]);
  const [isLoadingMood, setIsLoadingMood] = useState(false);

  // --- Modal States ---
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedSongForMenu, setSelectedSongForMenu] = useState<any>(null);

  // --- Profile & Playlist Form State ---
  const [userPhone, setUserPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  // --- Refs ---
  const playerRef = useRef<any>(null);
  const lyricContainerRef = useRef<HTMLDivElement>(null);
  const activeLyricRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------------------
  // Handlers & Functions
  // ----------------------------------------------------

  // Auth Handler
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authInput || !authPassword) {
      setAuthError('Email/No HP dan Password harus diisi!');
      return;
    }
    // Dummy login success
    setCurrentUser({ email: authInput });
    setAuthError(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsProfileOpen(false);
  };

  // Profile Update
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setProfileMsg('Konfirmasi password tidak cocok!');
      return;
    }
    setProfileMsg('Profil berhasil diperbarui!');
    setTimeout(() => setProfileMsg(null), 3000);
  };

  // Play Song & Queue Control
  const handlePlaySong = (song: any, playlist: any[] = []) => {
    setCurrentTrack(song);
    setIsPlaying(true);
    if (playlist.length > 0) {
      setQueue(playlist);
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (!queue.length || !currentTrack) return;
    const currentIndex = queue.findIndex((s) => s.videoId === currentTrack.videoId);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      setCurrentTrack(queue[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (!queue.length || !currentTrack) return;
    const currentIndex = queue.findIndex((s) => s.videoId === currentTrack.videoId);
    if (currentIndex > 0) {
      setCurrentTrack(queue[currentIndex - 1]);
    }
  };

  // Seek Progress
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    setPlayedProgress(clickPosition);
    if (duration > 0) {
      setPlayedSeconds(clickPosition * duration);
    }
  };

  // Liked Songs Toggle
  const toggleLikeSong = (song: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const exists = likedSongs.some((s) => s.videoId === song.videoId);
    if (exists) {
      setLikedSongs(likedSongs.filter((s) => s.videoId !== song.videoId));
    } else {
      setLikedSongs([...likedSongs, song]);
    }
  };

  const isSongLiked = (videoId: string) => {
    return likedSongs.some((s) => s.videoId === videoId);
  };

  // Playlist Management
  const handleCreatePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistTitle) return;
    const newPl = {
      id: Date.now().toString(),
      title: newPlaylistTitle,
      description: newPlaylistDesc,
      songs: [],
    };
    setUserPlaylists([...userPlaylists, newPl]);
    setNewPlaylistTitle('');
    setNewPlaylistDesc('');
    setIsCreatePlaylistOpen(false);
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (!selectedSongForMenu) return;
    setUserPlaylists(
      userPlaylists.map((pl) => {
        if (pl.id === playlistId) {
          const songExists = pl.songs.some((s: any) => s.videoId === selectedSongForMenu.videoId);
          if (!songExists) {
            return { ...pl, songs: [...pl.songs, selectedSongForMenu] };
          }
        }
        return pl;
      })
    );
    setIsAddToPlaylistOpen(false);
  };

  const handleDeletePlaylist = (playlistId: string) => {
    setUserPlaylists(userPlaylists.filter((pl) => pl.id !== playlistId));
  };

  const handleRemoveFromPlaylist = (playlistId: string, songId: string) => {
    setUserPlaylists(
      userPlaylists.map((pl) => {
        if (pl.id === playlistId) {
          return { ...pl, songs: pl.songs.filter((s: any) => s.videoId !== songId) };
        }
        return pl;
      })
    );
  };

  // Search Handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    // Dummy search result simulation
    setTimeout(() => {
      setSearchResults([
        {
          videoId: '1',
          title: `Hasil Cari: ${searchQuery}`,
          artists: [{ name: 'Artis Populer' }],
          thumbnails: [{ url: 'https://via.placeholder.com/150' }],
        },
      ]);
      setIsSearching(false);
    }, 600);
  };

  // Utility Formatter
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getHighResCover = (url?: string) => url || 'https://via.placeholder.com/300';

  // ----------------------------------------------------
  // Render App
  // ----------------------------------------------------

  // Tampilkan Layar Login/Register jika belum login
  if (!currentUser) {
    return (
      <AuthScreen
        authMode={authMode}
        setAuthMode={setAuthMode}
        authInput={authInput}
        setAuthInput={setAuthInput}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        authError={authError}
        setAuthError={setAuthError}
        handleAuthSubmit={handleAuthSubmit}
      />
    );
  }

  return (
    <div className="bg-black text-white min-h-screen font-sans relative selection:bg-white selection:text-black">
      {/* Header & Bottom Bar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setIsProfileOpen={setIsProfileOpen}
        setIsCreatePlaylistOpen={setIsCreatePlaylistOpen}
      />

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto min-h-screen">
        {activeTab === 'home' && (
          <HomeView
            currentUser={currentUser}
            quickPicks={quickPicks}
            isLoadingQuickPicks={isLoadingQuickPicks}
            selectedMood={selectedMood}
            setSelectedMood={setSelectedMood}
            moodSongs={moodSongs}
            isLoadingMood={isLoadingMood}
            handlePlaySong={handlePlaySong}
            setSelectedSongForMenu={setSelectedSongForMenu}
            setIsMenuOpen={setIsMenuOpen}
          />
        )}

        {activeTab === 'search' && (
          <SearchView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearchSubmit={handleSearchSubmit}
            searchResults={searchResults}
            isSearching={isSearching}
            handlePlaySong={handlePlaySong}
            setSelectedSongForMenu={setSelectedSongForMenu}
            setIsMenuOpen={setIsMenuOpen}
          />
        )}

        {activeTab === 'library' && (
          <LibraryView
            likedSongs={likedSongs}
            userPlaylists={userPlaylists}
            setIsCreatePlaylistOpen={setIsCreatePlaylistOpen}
            handlePlaySong={handlePlaySong}
            setSelectedPlaylist={setSelectedPlaylist}
            selectedPlaylist={selectedPlaylist}
            handleDeletePlaylist={handleDeletePlaylist}
            setSelectedSongForMenu={setSelectedSongForMenu}
            setIsMenuOpen={setIsMenuOpen}
          />
        )}
      </main>

      {/* Music Player Control (Floating & Full Screen) */}
      <MusicPlayer
        currentTrack={currentTrack}
        isPlayerOpen={isPlayerOpen}
        setIsPlayerOpen={setIsPlayerOpen}
        isPlaying={isPlaying}
        isBuffering={isBuffering}
        playedProgress={playedProgress}
        playedSeconds={playedSeconds}
        duration={duration}
        isShuffle={isShuffle}
        setIsShuffle={setIsShuffle}
        isRepeat={isRepeat}
        setIsRepeat={setIsRepeat}
        lyrics={lyrics}
        isLoadingLyrics={isLoadingLyrics}
        isLyricsExpanded={isLyricsExpanded}
        setIsLyricsExpanded={setIsLyricsExpanded}
        lyricLines={lyricLines}
        activeLineIndex={activeLineIndex}
        lyricContainerRef={lyricContainerRef}
        activeLyricRef={activeLyricRef}
        togglePlay={togglePlay}
        toggleLikeSong={toggleLikeSong}
        isSongLiked={isSongLiked}
        handleSeek={handleSeek}
        handlePrev={handlePrev}
        handleNext={handleNext}
        setSelectedSongForMenu={setSelectedSongForMenu}
        setIsMenuOpen={setIsMenuOpen}
        formatTime={formatTime}
        getHighResCover={getHighResCover}
      />

      {/* Popups & Modals */}
      <PlaylistModals
        isCreatePlaylistOpen={isCreatePlaylistOpen}
        setIsCreatePlaylistOpen={setIsCreatePlaylistOpen}
        newPlaylistTitle={newPlaylistTitle}
        setNewPlaylistTitle={setNewPlaylistTitle}
        newPlaylistDesc={newPlaylistDesc}
        setNewPlaylistDesc={setNewPlaylistDesc}
        handleCreatePlaylistSubmit={handleCreatePlaylistSubmit}
        isAddToPlaylistOpen={isAddToPlaylistOpen}
        setIsAddToPlaylistOpen={setIsAddToPlaylistOpen}
        userPlaylists={userPlaylists}
        selectedSongForMenu={selectedSongForMenu}
        handleAddToPlaylist={handleAddToPlaylist}
      />

      <ProfileModal
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        currentUser={currentUser}
        userPhone={userPhone}
        setUserPhone={setUserPhone}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        profileMsg={profileMsg}
        handleProfileUpdate={handleProfileUpdate}
        handleLogout={handleLogout}
      />

      <SongMenuModal
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        selectedSongForMenu={selectedSongForMenu}
        toggleLikeSong={toggleLikeSong}
        isSongLiked={isSongLiked}
        setIsAddToPlaylistOpen={setIsAddToPlaylistOpen}
        activePlaylistId={selectedPlaylist?.id}
        handleRemoveFromPlaylist={handleRemoveFromPlaylist}
      />

      {/* Hidden Engine Pemutar Audio */}
      <YouTubeAudioPlayer
        currentTrack={currentTrack}
        playerRef={playerRef}
        setIsPlaying={setIsPlaying}
        setIsBuffering={setIsBuffering}
        setPlayedProgress={setPlayedProgress}
        setPlayedSeconds={setPlayedSeconds}
        setDuration={setDuration}
        handleNext={handleNext}
      />
    </div>
  );
      }
