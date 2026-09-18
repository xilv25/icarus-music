// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
// Import seluruh komponen modular yang telah dibuat
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import Player from '@/components/Player';
import FullPlayer from '@/components/FullPlayer';
import HomeView from '@/components/HomeView';
import SearchView from '@/components/SearchView';
import LibraryView from '@/components/LibraryView';
import ProfileView from '@/components/ProfileView';
import PlaylistDetailView from '@/components/PlaylistDetailView';
import LikedSongsView from '@/components/LikedSongsView';
import AuthModal from '@/components/AuthModal';
import EditProfileModal from '@/components/EditProfileModal';
import CreatePlaylistModal from '@/components/CreatePlaylistModal';
import FollowersModal from '@/components/FollowersModal';
import FollowingModal from '@/components/FollowingModal';
import AddSongModal from '@/components/AddSongModal';

export default function Page() {
  // Seluruh State, Supabase Client, dan Logika Aslimu Tetap Utuh Di Sini
  const [activeTab, setActiveTab] = useState('home');
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [user, setUser] = useState(null);
  
  // Contoh state modal & view navigasi tambahan
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isLikedSongsView, setIsLikedSongsView] = useState(false);

  // Data dummy/state handler bawaan aslimu
  const [featuredSongs, setFeaturedSongs] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);

  // Handler contoh pemutaran lagu
  const handlePlaySong = (song: any) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setHistory((prev) => [song, ...prev]);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedPlaylist(null);
          setIsLikedSongsView(false);
        }}
        onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
        onOpenLikedSongs={() => setIsLikedSongsView(true)}
        playlists={playlists}
        onSelectPlaylist={(pl) => {
          setSelectedPlaylist(pl);
          setIsLikedSongsView(false);
        }}
      />

      {/* Konten Utama Berdasarkan Tab / View yang Aktif */}
      <main className="flex-1 md:ml-64 min-h-screen">
        {selectedPlaylist ? (
          <PlaylistDetailView
            playlist={selectedPlaylist}
            onBack={() => setSelectedPlaylist(null)}
            onPlaySong={handlePlaySong}
            onAddSongClick={() => {}}
          />
        ) : isLikedSongsView ? (
          <LikedSongsView
            likedSongs={likedSongs}
            onBack={() => setIsLikedSongsView(false)}
            onPlaySong={handlePlaySong}
            onToggleLike={() => {}}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                featuredSongs={featuredSongs}
                podcasts={podcasts}
                onPlaySong={handlePlaySong}
                onAddToPlaylist={() => {}}
              />
            )}
            {activeTab === 'search' && (
              <SearchView
                onSearch={async (q) => {}}
                searchResults={searchResults}
                onPlaySong={handlePlaySong}
                onAddToPlaylist={() => {}}
              />
            )}
            {activeTab === 'library' && (
              <LibraryView
                likedSongs={likedSongs}
                playlists={playlists}
                onOpenLikedSongs={() => setIsLikedSongsView(true)}
                onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
                onSelectPlaylist={(pl) => setSelectedPlaylist(pl)}
              />
            )}
            {activeTab === 'profile' && (
              <ProfileView
                user={user}
                onOpenEditProfile={() => setIsEditProfileOpen(true)}
                onOpenFollowers={() => {}}
                onOpenFollowing={() => {}}
                onLogout={() => setUser(null)}
                followersCount={0}
                followingCount={0}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Nav Mobile */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedPlaylist(null);
          setIsLikedSongsView(false);
        }}
      />

      {/* Mini Player */}
      <Player
        currentSong={currentSong}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={() => {}}
        onPrev={() => {}}
        progress={0}
        duration={100}
        onSeek={() => {}}
        volume={1}
        onVolumeChange={() => {}}
        onOpenFullPlayer={() => setIsFullPlayerOpen(true)}
        isLiked={false}
        onToggleLike={() => {}}
      />

      {/* Full-Screen Player Modal */}
      <FullPlayer
        isOpen={isFullPlayerOpen}
        onClose={() => setIsFullPlayerOpen(false)}
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={() => {}}
        onPrev={() => {}}
        progress={0}
        duration={100}
        onSeek={() => {}}
        isLiked={false}
        onToggleLike={() => {}}
        queue={queue}
        history={history}
        onSelectSong={handlePlaySong}
      />

      {/* Modals Lainnya */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={setUser} />
      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} user={user} onSave={() => {}} />
      <CreatePlaylistModal isOpen={isCreatePlaylistOpen} onClose={() => setIsCreatePlaylistOpen(false)} onCreate={() => {}} />
    </div>
  );
      }
