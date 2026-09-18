'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';

// --- IMPORT 13 KOMPONEN SESUAI NAMA FILE ASLI DI REPO ANDA ---
import AddToPlayListModal from '@/components/AddToPlayListModal';
import AuthForm from '@/components/AuthForm';
import FollowListModal from '@/components/FollowListModal';
import FullPlayer from '@/components/FullPlayer';
import HomeHeader from '@/components/HomeHeader';
import MiniPlayer from '@/components/MiniPlayer';
import PlayListDetailView from '@/components/PlayListDetailView';
import ProfileView from '@/components/ProfileView';
import SongItem from '@/components/SongItem';
import SongListCarousel from '@/components/SongListCarousel';
import SongMenuModal from '@/components/SongMenuModal';
import TrendingModal from '@/components/TrendingModal';
import UserCardModal from '@/components/UserCardModal';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ReactPlayer = dynamic(() => import('react-player/youtube'), { ssr: false });

export default function Home() {
  // --- 1. GLOBAL & AUTH STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authInput, setAuthInput] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // --- 2. USER PROFILE STATES ---
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [coverPic, setCoverPic] = useState('');
  const [bio, setBio] = useState('Music lover & Vibe enthusiast.');
  const [isVerified, setIsVerified] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [coverPicFile, setCoverPicFile] = useState<File | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [tempProfilePic, setTempProfilePic] = useState('');
  const [tempCoverPic, setTempCoverPic] = useState('');
  const [tempBio, setTempBio] = useState('');

  // --- 3. NAVIGATION & APP STATES ---
  const [activeTab, setActiveTab] = useState('home');
  const [homeSubTab, setHomeSubTab] = useState<'all' | 'music' | 'podcast'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [randomSongs, setRandomSongs] = useState<any[]>([]);
  const [randomSongsLimit, setRandomSongsLimit] = useState<number>(5);
  const [history, setHistory] = useState<any[]>([]);
  const [historyDisplayLimit, setHistoryDisplayLimit] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreenSearch, setIsFullScreenSearch] = useState(false);
  const [trendSongs, setTrendSongs] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- 4. LIBRARY & PLAYLIST STATES ---
  const [likedSongIds, setLikedSongIds] = useState<string[]>([]);
  const [likedSongsList, setLikedSongsList] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [activePlaylistView, setActivePlaylistView] = useState<any | null>(null);

  // --- 5. MODAL STATES ---
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [viewingProfileCard, setViewingProfileCard] = useState<any | null>(null);
  const [viewingUserPlaylistsCount, setViewingUserPlaylistsCount] = useState(0);
  const [viewingUserFollowers, setViewingUserFollowers] = useState(0);
  const [viewingUserFollowing, setViewingUserFollowing] = useState(0);
  const [isFollowingSelectedUser, setIsFollowingSelectedUser] = useState(false);

  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCollaborativePlaylist, setIsCollaborativePlaylist] = useState(false);
  const [collaboratorUsername, setCollaboratorUsername] = useState('');
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState<any | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedSongForMenu, setSelectedSongForMenu] = useState<any | null>(null);

  // --- 6. PLAYER STATES ---
  const playerRef = useRef<any>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentQueue, setCurrentQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState<'off' | 'all' | 'one'>('off');
  const [playedProgress, setPlayedProgress] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const isSeekingRef = useRef(false);

  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);
  const lyricContainerRef = useRef<HTMLDivElement>(null);
  const activeLyricRef = useRef<HTMLDivElement>(null);

  // --- INITIALIZATION & LOGIC HANDLERS (Auth, Supabase, Player, dll) ---
  // (Fungsi-fungsi handler seperti playSong, handleSearch, toggleLikeSong, dll. diletakkan di sini 
  // atau dibungkus menggunakan React Context agar kode page.tsx ini tetap ringkas dan elegan).

    // Jika belum login, tampilkan Komponen AuthForm
  if (!isLoggedIn) {
    return (
      <AuthForm 
        authMode={authMode}
        setAuthMode={setAuthMode}
        authInput={authInput}
        setAuthInput={setAuthInput}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        authError={authError}
        handleAuthSubmit={handleAuthSubmit} // Pastikan fungsi submit ini sudah terdefinisi di page.tsx
      />
    );
  }

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-gray-700">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-white text-black font-semibold px-4 py-2 rounded-full shadow-2xl z-[100] text-xs animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Hidden React Player for YouTube Audio/Video Streaming */}
      {currentTrack && (
        <div className="fixed -top-[200%] -left-[200%] w-0 h-0 opacity-0 pointer-events-none">
          <ReactPlayer
            ref={playerRef}
            url={`https://www.youtube.com/watch?v=${currentTrack.videoId}`}
            playing={isPlaying}
            onReady={() => setIsBuffering(false)}
            onBuffer={() => setIsBuffering(true)}
            onBufferEnd={() => setIsBuffering(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onProgress={({ played, playedSeconds }) => {
              if (!isSeekingRef.current) {
                setPlayedProgress(played);
                setPlayedSeconds(playedSeconds);
              }
            }}
            onDuration={(dur) => setDuration(dur)}
            // onEnded={handleNext}
            volume={1}
            width="100%"
            height="100%"
          />
        </div>
      )}

      {/* --- KONTEN UTAMA BERDASARKAN TAB AKTIF --- */}
      <div className="pb-32 px-4 pt-2 overflow-y-auto">
        {activeTab === 'home' && (
          <HomeTab 
            // Teruskan props dan state yang dibutuhkan Home
          />
        )}

        {activeTab === 'search' && (
          <SearchTab 
            // Teruskan props dan state pencarian
          />
        )}

        {activeTab === 'library' && (
          <LibraryTab 
            // Teruskan props library & playlist
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab 
            // Teruskan props profil & data Supabase
          />
        )}
      </div>

      {/* --- MODAL-MODAL PENDUKUNG --- */}
      {viewingProfileCard && <UserProfileCardModal />}
      {isFollowersModalOpen && <FollowersModal />}
      {isFollowingModalOpen && <FollowingModal />}
      {isFullScreenSearch && <FullScreenSearchModal />}
      {isMenuOpen && <SongMenuModal />}
      {isAddToPlaylistOpen && <AddToPlaylistModal />}
      {isCreatePlaylistOpen && <CreatePlaylistModal />}

      {/* --- PLAYER & NAVIGASI BAWAH --- */}
      {currentTrack && !isPlayerOpen && <MiniPlayer />}
      <FullPlayer />

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 w-full h-[64px] bg-gradient-to-t from-black via-black/95 to-black/80 px-6 flex items-center justify-between z-40 pb-2">
        {/* Nav Button Home, Search, Library, Profile */}
      </div>
    </div>
  );
    }
    
