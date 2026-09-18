'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';

// --- IMPORT KOMPONEN ---
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
  const [history, setHistory] = useState<any[]>([]);
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
  const [viewingProfileCard, setViewingProfileCard] = useState<any | null>(null);
  const [viewingUserPlaylistsCount, setViewingUserPlaylistsCount] = useState(0);
  const [viewingUserFollowers, setViewingUserFollowers] = useState(0);
  const [viewingUserFollowing, setViewingUserFollowing] = useState(0);
  const [isFollowingSelectedUser, setIsFollowingSelectedUser] = useState(false);

  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState<any | null>(null); // <--- TAMBAHKAN BARIS INI
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
  const [playedProgress, setPlayedProgress] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const isSeekingRef = useRef(false);

  // --- HELPER FUNGSI PLAYER & INTERAKSI ---
  const playSong = (song: any, queue: any[], index: number) => {
    setCurrentTrack(song);
    setCurrentQueue(queue);
    setCurrentIndex(index);
    setIsPlaying(true);
    // Masukkan ke history jika belum ada
    if (!history.some((h) => h.videoId === song.videoId)) {
      setHistory((prev) => [song, ...prev]);
    }
  };

  const toggleLikeSong = (song: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const videoId = song.videoId;
    if (likedSongIds.includes(videoId)) {
      setLikedSongIds((prev) => prev.filter((id) => id !== videoId));
      setToastMessage('Dihapus dari Liked Songs');
    } else {
      setLikedSongIds((prev) => [...prev, videoId]);
      setToastMessage('Ditambahkan ke Liked Songs');
    }
  };

  const isSongLiked = (videoId: string) => likedSongIds.includes(videoId);

  const isSongPlayedBefore = (videoId: string) => history.some((item) => item.videoId === videoId);

  const renderSongMenuButton = (song: any, e?: React.MouseEvent) => (
    <button
      onClick={(ev) => {
        ev.stopPropagation();
        setSelectedSongForMenu(song);
        setIsMenuOpen(true);
      }}
      className="p-1.5 text-gray-400 hover:text-white transition-colors"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
      </svg>
    </button>
  );

  // --- HELPER RENDER AVATAR ---
  const renderAvatar = (customClass = "w-8 h-8 text-xs font-bold", overridePic?: string, overrideUsername?: string) => {
    const pic = overridePic || profilePic;
    const name = overrideUsername || username || 'User';
    return (
      <div className={`${customClass} rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-white flex-shrink-0 shadow`}>
        {pic ? (
          <img src={pic} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{name?.[0]?.toUpperCase() || 'U'}</span>
        )}
      </div>
    );
  };

  // --- HANDLER AUTH SUBMIT (SUPABASE) ---
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!authInput || !authPassword) {
      setAuthError('Email dan password wajib diisi.');
      return;
    }

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authInput,
          password: authPassword,
        });
        if (error) throw error;
        if (data.user) {
          setIsLoggedIn(true);
          setUserId(data.user.id);
          setUserEmail(data.user.email || '');
          setToastMessage('Berhasil masuk!');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: authInput,
          password: authPassword,
        });
        if (error) throw error;
        if (data.user) {
          setToastMessage('Registrasi berhasil! Silakan masuk.');
          setAuthMode('login');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Terjadi kesalahan pada autentikasi.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setToastMessage('Berhasil keluar.');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setUsername(tempUsername);
    setBio(tempBio);
    if (tempProfilePic) setProfilePic(tempProfilePic);
    if (tempCoverPic) setCoverPic(tempCoverPic);
    setIsEditingProfile(false);
    setIsSavingProfile(false);
    setToastMessage('Profil berhasil disimpan!');
  };

  const handleDeviceFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    previewSetter: (val: string) => void,
    fileSetter: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      fileSetter(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        previewSetter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
        handleAuthSubmit={handleAuthSubmit}
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

      {/* Hidden React Player */}
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
            volume={1}
            width="100%"
            height="100%"
          />
        </div>
      )}

      {/* --- KONTEN UTAMA BERDASARKAN TAB AKTIF --- */}
      <div className="pb-32 px-4 pt-2 overflow-y-auto">
        <HomeHeader 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          homeSubTab={homeSubTab}
          setHomeSubTab={setHomeSubTab}
          renderAvatar={renderAvatar}
        />
        
        {activeTab === 'home' && (
          <div className="space-y-6 mt-4">
            <SongListCarousel 
              title="Trending Songs" 
              songs={trendSongs} 
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              playSong={playSong}
              toggleLikeSong={toggleLikeSong}
              isSongLiked={isSongLiked}
              isSongPlayedBefore={isSongPlayedBefore}
              renderSongMenuButton={renderSongMenuButton}
            />
            <SongListCarousel 
              title="Rekomendasi Untukmu" 
              songs={randomSongs} 
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              playSong={playSong}
              toggleLikeSong={toggleLikeSong}
              isSongLiked={isSongLiked}
              isSongPlayedBefore={isSongPlayedBefore}
              renderSongMenuButton={renderSongMenuButton}
            />
          </div>
        )}

        {activeTab === 'profile' && (
          <ProfileView 
            username={username}
            userEmail={userEmail}
            userId={userId}
            bio={bio}
            isVerified={isVerified}
            profilePic={profilePic}
            coverPic={coverPic}
            followersCount={followersCount}
            followingCount={followingCount}
            likedSongsList={likedSongsList}
            playlists={playlists}
            isEditingProfile={isEditingProfile}
            setIsEditingProfile={setIsEditingProfile}
            tempUsername={tempUsername}
            setTempUsername={setTempUsername}
            tempBio={tempBio}
            setTempBio={setTempBio}
            tempProfilePic={tempProfilePic}
            setTempProfilePic={setTempProfilePic}
            tempCoverPic={tempCoverPic}
            setTempCoverPic={setTempCoverPic}
            isSavingProfile={isSavingProfile}
            handleSaveProfile={handleSaveProfile}
            handleDeviceFileUpload={handleDeviceFileUpload}
            setProfilePicFile={setProfilePicFile}
            setCoverPicFile={setCoverPicFile}
            renderAvatar={renderAvatar}
            setIsFollowersModalOpen={setIsFollowersModalOpen}
            setIsFollowingModalOpen={setIsFollowingModalOpen}
            handleLogout={handleLogout}
          />
        )}
      </div>

            {/* --- MODAL-MODAL PENDUKUNG --- */}
      {viewingProfileCard && (
        <UserCardModal 
          viewingProfileCard={viewingProfileCard}
          onClose={() => setViewingProfileCard(null)}
          renderAvatar={renderAvatar}
          viewingUserPlaylistsCount={viewingUserPlaylistsCount}
          viewingUserFollowers={viewingUserFollowers}
          viewingUserFollowing={viewingUserFollowing}
          isFollowingSelectedUser={isFollowingSelectedUser}
          toggleFollowUser={() => {
            // Tambahkan logika toggle follow di sini sesuai kebutuhan Anda
            setIsFollowingSelectedUser(!isFollowingSelectedUser);
          }}
        />
      )}

      {isFollowingModalOpen && (
        <FollowListModal 
          isOpen={isFollowingModalOpen} 
          onClose={() => setIsFollowingModalOpen(false)} 
          title="Mengikuti" 
          count={followingCount}
          list={followingList} 
          type="following"
          onAction={() => {}}
          emptyText="Belum mengikuti siapapun."
        />
      )}

      {isMenuOpen && selectedSongForMenu && (
        <SongMenuModal 
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          song={selectedSongForMenu}
          currentTrack={currentTrack}
          isLiked={isSongLiked(selectedSongForMenu?.videoId)}
          onToggleLike={(song) => toggleLikeSong(song)}
          onOpenAddToPlaylist={(song) => {
            setIsMenuOpen(false);
            setSongToAddToPlaylist(song);
            setIsAddToPlaylistOpen(true);
          }}
          onShare={(song) => {
            navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${song.videoId}`);
            setToastMessage('Link lagu disalin ke clipboard!');
            setIsMenuOpen(false);
          }}
        />
      )}

      <AddToPlayListModal 
        isOpen={isAddToPlaylistOpen}
        onClose={() => setIsAddToPlaylistOpen(false)}
        playlists={playlists}
        onSelectPlaylist={() => {
          setIsAddToPlaylistOpen(false);
          setToastMessage('Lagu ditambahkan ke playlist!');
        }}
        onCreatePlaylistClick={() => {
          setIsAddToPlaylistOpen(false);
          setIsCreatePlaylistOpen(true);
        }}
      />

      {/* --- PLAYER & NAVIGASI BAWAH --- */}
      {currentTrack && !isPlayerOpen && (
        <MiniPlayer 
          currentTrack={currentTrack}
          isPlayerOpen={isPlayerOpen}
          setIsPlayerOpen={setIsPlayerOpen}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          playedProgress={playedProgress}
          togglePlay={() => setIsPlaying(!isPlaying)}
          toggleLikeSong={toggleLikeSong}
          isSongLiked={isSongLiked}
        />
      )}
      
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 w-full h-[64px] bg-gradient-to-t from-black via-black/95 to-black/80 px-6 flex items-center justify-between z-40 pb-2 border-t border-white/5">
        <button onClick={() => setActiveTab('home')} className={`text-xs font-bold transition-colors ${activeTab === 'home' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Home</button>
        <button onClick={() => setActiveTab('search')} className={`text-xs font-bold transition-colors ${activeTab === 'search' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Search</button>
        <button onClick={() => setActiveTab('library')} className={`text-xs font-bold transition-colors ${activeTab === 'library' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Library</button>
        <button onClick={() => setActiveTab('profile')} className={`text-xs font-bold transition-colors ${activeTab === 'profile' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Profile</button>
      </div>
    </div>
  );
        }
            
