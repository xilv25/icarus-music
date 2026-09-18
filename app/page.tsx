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

// --- HELPER FUNCTIONS ---
const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const getHighResCover = (url?: string) => {
  if (!url) return '';
  if (url.includes('=w')) {
    return url.replace(/=w\d+-h\d+/, '=w1080-h1080');
  }
  if (url.includes('ytimg.com')) {
    return url.replace('hqdefault.jpg', 'maxresdefault.jpg').replace('default.jpg', 'maxresdefault.jpg');
  }
  return url;
};

const generateRandomId = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

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
  const [collabRequests, setCollabRequests] = useState<any[]>([]);

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

  // --- INITIALIZATION EFFECTS ---
  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        setUserEmail(session.user.email || '');
        await fetchSupabaseProfile(session.user.id, session.user.email || '');
      } else {
        const localAuth = localStorage.getItem('icarus_logged_in');
        const localEmail = localStorage.getItem('icarus_email');
        if (localAuth === 'true' && localEmail) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', localEmail)
            .single();

          if (data) {
            setIsLoggedIn(true);
            const activeId = data.numeric_id || data.id || generateRandomId();
            setUserId(activeId);
            setUserEmail(data.email);
            setUsername(data.username || '');
            setTempUsername(data.username || '');
            setProfilePic(data.profile_pic || '');
            setCoverPic(data.cover_pic || '');
            setBio(data.bio || 'Music lover & Vibe enthusiast.');
            setTempBio(data.bio || 'Music lover & Vibe enthusiast.');
            setIsVerified(data.is_verified || false);
            fetchFollowData(activeId);
          } else {
            handleLogout();
            setToastMessage("Sesi kedaluwarsa. Silakan masuk kembali.");
          }
        }
      }
    };

    initSession();

    const savedHistory = JSON.parse(localStorage.getItem('icarus_history') || '[]');
    setHistory(savedHistory);

    const savedLikes = JSON.parse(localStorage.getItem('icarus_liked_ids') || '[]');
    setLikedSongIds(savedLikes);
    const savedLikedFull = JSON.parse(localStorage.getItem('icarus_liked_full') || '[]');
    setLikedSongsList(savedLikedFull);

    const savedPlaylists = JSON.parse(localStorage.getItem('icarus_playlists') || '[]');
    setPlaylists(savedPlaylists);

    loadHomepageData();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (currentTrack) {
      setLyrics(null);
      setIsLoadingLyrics(true);
      const fetchLyrics = async () => {
        try {
          const artist = currentTrack.artists?.[0]?.name || '';
          const title = currentTrack.title?.replace(/\s*\(.*?\)\s*/g, '').split(' - ')[0] || '';
          const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
          if (!res.ok) throw new Error('Not found');
          const data = await res.json();
          setLyrics(data.lyrics);
        } catch {
          setLyrics("Maaf, lirik tidak tersedia untuk lagu ini.");
        } finally {
          setIsLoadingLyrics(false);
        }
      };
      fetchLyrics();
    }
  }, [currentTrack?.videoId]);

  const lyricLines = lyrics ? lyrics.split('\n').filter(l => l.trim() !== '') : [];
  const activeLineIndex = duration > 0 ? Math.min(Math.floor((playedSeconds / duration) * lyricLines.length), lyricLines.length - 1) : 0;

  useEffect(() => {
    if (!isLyricsExpanded && activeLyricRef.current && lyricContainerRef.current) {
      const container = lyricContainerRef.current;
      const activeEl = activeLyricRef.current;
      container.scrollTo({ top: activeEl.offsetTop - (container.clientHeight / 2), behavior: 'smooth' });
    }
  }, [activeLineIndex, isLyricsExpanded]);

  // --- API & DATA FETCHING HANDLERS ---
  const loadHomepageData = async () => {
    setIsLoading(true);
    try {
      const res1 = await fetch(`/api/search?q=Global Viral Hits 2026`);
      const json1 = await res1.json();
      if (json1.status === 'success') setSuggestions(json1.data.slice(0, 15));

      const res2 = await fetch(`/api/search?q=Trending Chill Mix Vibes`);
      const json2 = await res2.json();
      if (json2.status === 'success') setRandomSongs(json2.data.slice(0, 20));

      const res3 = await fetch(`/api/search?q=Top Chart Trending Songs`);
      const json3 = await res3.json();
      if (json3.status === 'success') setTrendSongs(json3.data.slice(0, 15));
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const fetchSupabaseProfile = async (uid: string, email: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (data) {
        let activeNumericId = data.numeric_id;
        if (!activeNumericId) {
          activeNumericId = generateRandomId();
          await supabase.from('profiles').update({ numeric_id: activeNumericId }).eq('email', email);
        }
        setUserId(activeNumericId);
        setUsername(data.username || email.split('@')[0]);
        setTempUsername(data.username || email.split('@')[0]);
        setProfilePic(data.profile_pic || '');
        setCoverPic(data.cover_pic || '');
        setBio(data.bio || 'Music lover & Vibe enthusiast.');
        setTempBio(data.bio || 'Music lover & Vibe enthusiast.');
        setIsVerified(data.is_verified || false);
        fetchFollowData(activeNumericId);
      } else {
        const generatedNumericId = generateRandomId();
        const defaultUsername = email.split('@')[0];
        await supabase.from('profiles').upsert({
          id: uid,
          numeric_id: generatedNumericId,
          email: email,
          username: defaultUsername,
          bio: 'Music lover & Vibe enthusiast.',
          is_verified: false
        });
        setUserId(generatedNumericId);
        setUsername(defaultUsername);
        setTempUsername(defaultUsername);
        setBio('Music lover & Vibe enthusiast.');
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  };

  const fetchFollowData = async (targetNumericId: string) => {
    try {
      const { data: followers } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', targetNumericId);

      if (followers) {
        setFollowersCount(followers.length);
        const followerIds = followers.map((f: any) => f.follower_id);
        if (followerIds.length > 0) {
          const { data: followerProfiles } = await supabase
            .from('profiles')
            .select('*')
            .in('numeric_id', followerIds);
          setFollowersList(followerProfiles || []);
        } else {
          setFollowersList([]);
        }
      }

      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', targetNumericId);

      if (following) {
        setFollowingCount(following.length);
        const followingIds = following.map((f: any) => f.following_id);
        if (followingIds.length > 0) {
          const { data: followingProfiles } = await supabase
            .from('profiles')
            .select('*')
            .in('numeric_id', followingIds);
          setFollowingList(followingProfiles || []);
        } else {
          setFollowingList([]);
        }
      }
    } catch (err) {
      console.error("Error fetching follow data:", err);
    }
  };

  const removeFollowerFromList = async (followerNumericId: string) => {
    try {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerNumericId)
        .eq('following_id', userId);
      
      setFollowersList(prev => prev.filter(u => String(u.numeric_id || u.id) !== followerNumericId));
      setFollowersCount(prev => Math.max(0, prev - 1));
      setToastMessage("Pengikut dihapus.");
    } catch (e) {
      console.error(e);
    }
  };

  const unfollowFromList = async (targetNumericId: string) => {
    try {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', userId)
        .eq('following_id', targetNumericId);

      setFollowingList(prev => prev.filter(u => String(u.numeric_id || u.id) !== targetNumericId));
      setFollowingCount(prev => Math.max(0, prev - 1));
      setToastMessage("Berhenti mengikuti.");
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFollowUser = async () => {
    if (!viewingProfileCard) return;
    const targetNumericId = String(viewingProfileCard.numeric_id || viewingProfileCard.id);

    try {
      if (isFollowingSelectedUser) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', userId)
          .eq('following_id', targetNumericId);
        
        setIsFollowingSelectedUser(false);
        setViewingUserFollowers(prev => Math.max(0, prev - 1));
        setToastMessage("Berhenti mengikuti.");
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: userId,
            following_id: targetNumericId
          });

        setIsFollowingSelectedUser(true);
        setViewingUserFollowers(prev => prev + 1);
        setToastMessage("Berhasil mengikuti!");
      }
      fetchFollowData(userId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setUserSearchResults([]);
      return;
    }

    if (query.startsWith('@')) {
      const cleanQuery = query.substring(1).trim();
      if (cleanQuery) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .ilike('username', `%${cleanQuery}%`)
          .limit(10);
        setUserSearchResults(data || []);
      } else {
        setUserSearchResults([]);
      }
      setSearchResults([]);
      return;
    }

    setUserSearchResults([]);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json.status === 'success') {
        setSearchResults(json.data);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  // --- MUSIC & PLAYBACK CONTROLLERS ---
  const playSong = (song: any, queue: any[] = [], index: number = 0) => {
    setCurrentTrack(song);
    setIsPlaying(true);
    if (queue.length > 0) {
      setCurrentQueue(queue);
      setCurrentIndex(index);
    } else {
      setCurrentQueue([song]);
      setCurrentIndex(0);
    }

    const exists = history.some(h => h.videoId === song.videoId);
    let newHistory = history;
    if (!exists) {
      newHistory = [song, ...history];
      setHistory(newHistory);
      localStorage.setItem('icarus_history', JSON.stringify(newHistory));
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentQueue.length === 0) return;
    let nextIndex = currentIndex + 1;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * currentQueue.length);
    } else if (nextIndex >= currentQueue.length) {
      nextIndex = 0;
    }
    setCurrentIndex(nextIndex);
    playSong(currentQueue[nextIndex], currentQueue, nextIndex);
  };

  const handlePrev = () => {
    if (currentQueue.length === 0) return;
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = currentQueue.length - 1;
    }
    setCurrentIndex(prevIndex);
    playSong(currentQueue[prevIndex], currentQueue, prevIndex);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setPlayedProgress(pos);
    if (playerRef.current) {
      playerRef.current.seekTo(pos, 'fraction');
    }
  };

  const toggleLikeSong = (song: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const id = song.videoId;
    let updatedIds = [...likedSongIds];
    let updatedList = [...likedSongsList];

    if (updatedIds.includes(id)) {
      updatedIds = updatedIds.filter(i => i !== id);
      updatedList = updatedList.filter(s => s.videoId !== id);
      setToastMessage("Dihapus dari Liked Songs");
    } else {
      updatedIds.push(id);
      updatedList.unshift(song);
      setToastMessage("Ditambahkan ke Liked Songs");
    }

    setLikedSongIds(updatedIds);
    setLikedSongsList(updatedList);
    localStorage.setItem('icarus_liked_ids', JSON.stringify(updatedIds));
    localStorage.setItem('icarus_liked_full', JSON.stringify(updatedList));
  };

  const isSongLiked = (videoId: string) => likedSongIds.includes(videoId);

  // --- HELPER RENDER AVATAR ---
  const renderAvatar = (customClass = "w-8 h-8 text-xs font-bold", overridePic?: string, overrideUsername?: string) => {
    const picToUse = overridePic !== undefined ? overridePic : profilePic;
    const nameToUse = overrideUsername !== undefined ? overrideUsername : username;

    return (
      <div className="relative inline-block flex-shrink-0">
        {picToUse && picToUse.trim() ? (
          <img src={picToUse} alt="Profile" className={`${customClass} rounded-full object-cover ${isVerified ? 'border-2 border-blue-500 shadow-md shadow-blue-500/30' : ''}`} />
        ) : (
          <div className={`${customClass} rounded-full bg-gradient-to-tr from-gray-600 to-gray-400 flex items-center justify-center text-white uppercase shadow-md ${isVerified ? 'border-2 border-blue-500 shadow-md shadow-blue-500/30' : ''}`}>
            {nameToUse.trim() ? (
              nameToUse.trim().split(' ').length > 1 ? `${nameToUse.trim().split(' ')[0][0]}${nameToUse.trim().split(' ')[1][0]}` : nameToUse.trim().substring(0, 2)
            ) : userEmail.trim() ? (
              userEmail.split('@')[0].substring(0, 2)
            ) : 'ME'}
          </div>
        )}
        {isVerified && (
          <span className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-0.5 shadow flex items-center justify-center w-4 h-4 text-[9px] font-bold border border-black">
            ✓
          </span>
        )}
      </div>
    );
  };

  // --- AUTH SUBMIT HANDLER ---
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
          setUserEmail(data.user.email || '');
          await fetchSupabaseProfile(data.user.id, data.user.email || '');
          setToastMessage('Berhasil masuk!');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: authInput,
          password: authPassword,
        });
        if (error) throw error;
        if (data.user) {
          const generatedNumericId = generateRandomId();
          await supabase.from('profiles').upsert({
            id: data.user.id,
            numeric_id: generatedNumericId,
            email: authInput,
            username: authInput.split('@')[0],
            bio: 'Music lover & Vibe enthusiast.',
            is_verified: false
          });
          setUserId(generatedNumericId);
          setToastMessage('Registrasi berhasil! Silakan masuk.');
          setAuthMode('login');
        }
      }
      localStorage.setItem('icarus_logged_in', 'true');
      localStorage.setItem('icarus_email', authInput);
    } catch (err: any) {
      setAuthError(err.message || 'Terjadi kesalahan pada autentikasi.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('icarus_logged_in');
    localStorage.removeItem('icarus_email');
    setIsLoggedIn(false);
    setUserEmail('');
    setUsername('');
    setProfilePic('');
    setCoverPic('');
    setBio('');
    setIsVerified(false);
    setToastMessage('Berhasil keluar.');
  };

  const uploadProfileImage = async (file: File, userUid: string, type: 'avatar' | 'cover') => {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${userUid}/${type}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingProfile) return;

    const cleanUsername = tempUsername.trim();
    if (!cleanUsername) {
      setToastMessage('Username tidak boleh kosong.');
      return;
    }

    setIsSavingProfile(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        setToastMessage('Session Supabase tidak ditemukan. Silakan login kembali.');
        return;
      }

      let savedProfilePic = tempProfilePic;
      let savedCoverPic = tempCoverPic;

      if (profilePicFile) {
        savedProfilePic = await uploadProfileImage(profilePicFile, user.id, 'avatar');
      }

      if (coverPicFile) {
        savedCoverPic = await uploadProfileImage(coverPicFile, user.id, 'cover');
      }

      const profilePayload = {
        id: user.id,
        email: user.email || userEmail,
        username: cleanUsername,
        profile_pic: savedProfilePic || null,
        cover_pic: savedCoverPic || null,
        bio: tempBio.trim(),
      };

      const { data, error: profileError } = await supabase
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' })
        .select()
        .single();

      if (profileError) throw profileError;

      setUsername(data.username || '');
      setProfilePic(data.profile_pic || '');
      setCoverPic(data.cover_pic || '');
      setBio(data.bio || '');

      setTempUsername(data.username || '');
      setTempProfilePic(data.profile_pic || '');
      setTempCoverPic(data.cover_pic || '');
      setTempBio(data.bio || '');

      setProfilePicFile(null);
      setCoverPicFile(null);
      setIsEditingProfile(false);
      setToastMessage('Profil berhasil disimpan ke Supabase.');
    } catch (error: any) {
      console.error('Gagal menyimpan profil:', error);
      setToastMessage(error?.message || 'Gagal menyimpan profil ke Supabase.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeviceFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    previewSetter: (val: string) => void,
    fileSetter: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setToastMessage('Format foto harus JPG, PNG, WEBP, atau GIF.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToastMessage('Ukuran foto maksimal 5 MB.');
      e.target.value = '';
      return;
    }

    fileSetter(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      previewSetter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // --- PLAYLIST HANDLERS ---
  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const currentUserTag = username || userEmail.split('@')[0] || 'Anda';
    const newPlaylist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      isCollaborative: isCollaborativePlaylist,
      collaborator: isCollaborativePlaylist ? collaboratorUsername : '',
      songs: songToAddToPlaylist ? [songToAddToPlaylist] : [],
      addedBy: songToAddToPlaylist ? { [songToAddToPlaylist.videoId]: currentUserTag } : {}
    };

    const updated = [...playlists, newPlaylist];
    setPlaylists(updated);
    localStorage.setItem('icarus_playlists', JSON.stringify(updated));
    setNewPlaylistName('');
    setIsCollaborativePlaylist(false);
    setCollaboratorUsername('');
    setIsCreatePlaylistOpen(false);
    setIsAddToPlaylistOpen(false);
    setSongToAddToPlaylist(null);
    setToastMessage("Playlist baru dibuat & disimpan!");
  };

  const deletePlaylist = (playlistId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = playlists.filter(pl => pl.id !== playlistId);
    setPlaylists(updated);
    localStorage.setItem('icarus_playlists', JSON.stringify(updated));
    if (activePlaylistView?.id === playlistId) setActivePlaylistView(null);
    setToastMessage("Playlist berhasil dihapus.");
  };

  const removeSongFromPlaylist = (playlistId: string, videoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = playlists.map(pl => {
      if (pl.id === playlistId) {
        const filteredSongs = pl.songs.filter((s: any) => s.videoId !== videoId);
        return { ...pl, songs: filteredSongs };
      }
      return pl;
    });
    setPlaylists(updated);
    localStorage.setItem('icarus_playlists', JSON.stringify(updated));
    if (activePlaylistView?.id === playlistId) {
      setActivePlaylistView({ ...activePlaylistView, songs: activePlaylistView.songs.filter((s: any) => s.videoId !== videoId) });
    }
    setToastMessage("Lagu dihapus dari playlist.");
  };

  const addSongToPlaylist = (playlistId: string) => {
    if (!songToAddToPlaylist) return;
    const currentUserTag = username || userEmail.split('@')[0] || 'Anda';
    const updated = playlists.map(pl => {
      if (pl.id === playlistId) {
        if (!pl.songs.some((s: any) => s.videoId === songToAddToPlaylist.videoId)) {
          const newSongs = [...pl.songs, songToAddToPlaylist];
          const newAddedBy = { ...(pl.addedBy || {}), [songToAddToPlaylist.videoId]: currentUserTag };
          return { ...pl, songs: newSongs, addedBy: newAddedBy };
        }
      }
      return pl;
    });

    setPlaylists(updated);
    localStorage.setItem('icarus_playlists', JSON.stringify(updated));
    setIsAddToPlaylistOpen(false);
    setSongToAddToPlaylist(null);
    setToastMessage("Lagu ditambahkan ke playlist!");
  };

  const openUserProfileCard = async (user: any) => {
    const targetNumericId = String(user.numeric_id || user.id);
    
    // Fetch stats user yang di-click
    const { data: userPl } = await supabase.from('playlists').select('id').eq('user_id', user.id);
    const { data: userFol } = await supabase.from('follows').select('follower_id').eq('following_id', targetNumericId);
    const { data: userFing } = await supabase.from('follows').select('following_id').eq('follower_id', targetNumericId);
    
    // Cek apakah kita sudah follow user ini
    const { data: checkFollow } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', userId)
      .eq('following_id', targetNumericId)
      .maybeSingle();

    setViewingUserPlaylistsCount(userPl?.length || 0);
    setViewingUserFollowers(userFol?.length || 0);
    setViewingUserFollowing(userFing?.length || 0);
    setIsFollowingSelectedUser(!!checkFollow);
    setViewingProfileCard(user);
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
        
        {/* --- TAB: HOME --- */}
        {activeTab === 'home' && (
          <div className="space-y-6 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Trending Songs</h2>
              <button onClick={() => setIsFullScreenSearch(true)} className="text-xs text-gray-400 hover:text-white">Lihat Semua</button>
            </div>
            <SongListCarousel 
              title="" 
              songs={trendSongs} 
              onSongSelect={(song, idx) => playSong(song, trendSongs, idx)}
            />

            <h2 className="text-xl font-bold mt-6">Rekomendasi Untukmu</h2>
            <SongListCarousel 
              title="" 
              songs={randomSongs} 
              onSongSelect={(song, idx) => playSong(song, randomSongs, idx)}
            />
          </div>
        )}

        {/* --- TAB: SEARCH --- */}
        {activeTab === 'search' && (
          <div className="space-y-4 mt-4 animate-fade-in">
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Cari lagu, artis, atau @username..."
                className="w-full bg-[#1e1e1e] border border-white/10 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-white pl-11"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>

            {/* Hasil Pencarian User (@) */}
            {userSearchResults.length > 0 && (
              <div className="flex flex-col gap-2 mt-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pengguna</h3>
                {userSearchResults.map((usr: any) => (
                  <div 
                    key={usr.id} 
                    onClick={() => openUserProfileCard(usr)}
                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    {renderAvatar("w-10 h-10 text-sm font-bold", usr.profile_pic, usr.username)}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">@{usr.username}</span>
                      <span className="text-[10px] font-mono text-gray-400">ID: {usr.numeric_id || usr.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Hasil Pencarian Lagu */}
            {searchResults.length > 0 && (
              <div className="flex flex-col gap-2 mt-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Lagu</h3>
                {searchResults.map((song: any, idx: number) => (
                  <SongItem 
                    key={idx}
                    song={song}
                    onPlay={() => playSong(song, searchResults, idx)}
                    onMenuOpen={(s) => { setSelectedSongForMenu(s); setIsMenuOpen(true); }}
                  />
                ))}
              </div>
            )}

            {!searchQuery && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-gray-300 mb-3">Saran Pencarian</h3>
                <div className="flex flex-wrap gap-2">
                  {suggestions.slice(0, 8).map((s: any, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => handleSearch(s.title)}
                      className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs hover:bg-white/10 transition-colors"
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      
        {/* --- TAB: LIBRARY --- */}
{activeTab === 'library' && (
  <div className="space-y-6 mt-4 animate-fade-in">
    {activePlaylistView ? (
      <PlayListDetailView 
        playlist={activePlaylistView}
        onBack={() => setActivePlaylistView(null)}
        onPlaySong={(song: any, idx: number) => playSong(song, activePlaylistView.songs, idx)}
        onRemoveSong={(videoId: string) => removeSongFromPlaylist(activePlaylistView.id, videoId)}
        onDeletePlaylist={() => deletePlaylist(activePlaylistView.id)}
        onToggleLike={(s: any) => toggleLikeSong(s)}
        isSongLiked={(id: string) => isSongLiked(id)}
      />
    ) : (
      <>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Koleksi Musikmu</h2>
          <button 
            onClick={() => setIsCreatePlaylistOpen(true)}
            className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
          >
            + Buat Playlist
          </button>
        </div>

        {/* Notifikasi Undangan Kolaborasi */}
        {collabRequests && collabRequests.length > 0 && (
          <div className="space-y-2 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <svg className="w-4 h-4 fill-purple-400" viewBox="0 0 24 24">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
              </svg>
              Undangan Playlist Kolaborasi
            </h3>
            <div className="flex flex-col gap-2">
              {collabRequests.map((req: any) => (
                <div key={req.id} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-xs text-white font-semibold">
                      @{req.sender} mengundangmu ke <span className="text-purple-300 font-bold">"{req.playlistName}"</span>
                    </span>
                    <span className="text-[10px] text-gray-400">Kalian saling follow untuk berkolaborasi.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => typeof handleAcceptCollabRequest !== 'undefined' && handleAcceptCollabRequest(req)} 
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-xs font-bold transition-colors cursor-pointer"
                    >
                      Setujui
                    </button>
                    <button 
                      onClick={() => typeof handleRejectCollabRequest !== 'undefined' && handleRejectCollabRequest(req)} 
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded-full text-xs font-medium transition-colors cursor-pointer"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Liked Songs Entry */}
        <div 
          onClick={() => setActivePlaylistView({ id: 'liked', name: 'Lagu yang Disukai', songs: likedSongsList, isLikedSongs: true })}
          className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-900/40 to-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors"
        >
          <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-base">Lagu yang Disukai</span>
            <span className="text-xs text-gray-400">{likedSongsList.length} lagu</span>
          </div>
        </div>

        {/* Playlist List (Persegi Panjang Horizontal, Tanpa Panah & Tanpa Emoji) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Playlist Kamu</h3>
          {playlists.length > 0 ? (
            <div className="flex flex-col gap-3">
              {playlists.map((pl: any) => (
                <div 
                  key={pl.id}
                  onClick={() => setActivePlaylistView(pl)}
                  className="bg-[#181818] border border-white/10 p-4 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-white font-bold text-lg border border-white/5 flex-shrink-0">
                      {pl.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-white text-sm truncate">{pl.name}</h4>
                        {pl.isCollaborative && (
                          <svg className="w-4 h-4 fill-purple-400 flex-shrink-0" viewBox="0 0 24 24">
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                          </svg>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">{pl.songs?.length || 0} lagu</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic py-4">Belum ada playlist tersimpan.</p>
          )}
        </div>

        {/* Listening History */}
        <div className="space-y-3 pt-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Terakhir Diputar</h3>
          <div className="flex flex-col gap-2">
            {history.slice(0, historyDisplayLimit).map((song: any, idx: number) => (
              <SongItem 
                key={idx}
                song={song}
                onPlay={() => playSong(song, history, idx)}
                onMenuOpen={(s) => { setSelectedSongForMenu(s); setIsMenuOpen(true); }}
              />
            ))}
          </div>
        </div>
      </>
    )}
  </div>
)}
                                               
        {/* --- TAB: PROFILE --- */}
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
          viewingUserPlaylistsCount={viewingUserPlaylistsCount}
          viewingUserFollowers={viewingUserFollowers}
          viewingUserFollowing={viewingUserFollowing}
          isFollowingSelectedUser={isFollowingSelectedUser}
          toggleFollowUser={toggleFollowUser}
          renderAvatar={renderAvatar}
        />
      )}
      
      {isFollowersModalOpen && (
        <FollowListModal 
          isOpen={isFollowersModalOpen} 
          onClose={() => setIsFollowersModalOpen(false)} 
          title="Pengikut" 
          count={followersCount}
          list={followersList} 
          type="followers"
          onAction={(id) => removeFollowerFromList(id)}
          emptyText="Belum ada pengikut."
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
          onAction={(id) => unfollowFromList(id)}
          emptyText="Belum mengikuti siapapun."
        />
      )}

      {isMenuOpen && (
  <SongMenuModal 
    isOpen={isMenuOpen}
    onClose={() => setIsMenuOpen(false)}
    song={selectedSongForMenu || currentTrack}
    isLiked={isSongLiked((selectedSongForMenu || currentTrack)?.videoId)}
    onToggleLike={(s: any) => toggleLikeSong(s)}
    onAddToPlaylist={(s: any) => {
      setSongToAddToPlaylist(s);
      setIsAddToPlaylistOpen(true);
      setIsMenuOpen(false);
    }}
    setToastMessage={setToastMessage}
  />
)}

      <AddToPlayListModal 
        isOpen={isAddToPlaylistOpen}
        onClose={() => setIsAddToPlaylistOpen(false)}
        playlists={playlists}
        onSelectPlaylist={(playlistId) => addSongToPlaylist(playlistId)}
        onCreatePlaylistClick={() => {
          setIsAddToPlaylistOpen(false);
          setIsCreatePlaylistOpen(true);
        }}
      />

      {isCreatePlaylistOpen && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsCreatePlaylistOpen(false)}>
          <form onSubmit={handleCreatePlaylist} onClick={(e) => e.stopPropagation()} className="bg-[#1c1c1c] border border-white/10 w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-lg font-bold">Buat Playlist Baru</h3>
            <input 
              type="text" 
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Nama playlist (mis: Vibes Chill 2026)"
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white"
              autoFocus
            />

            <div className="flex flex-col gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isCollaborativePlaylist}
                  onChange={(e) => setIsCollaborativePlaylist(e.target.checked)}
                  className="rounded bg-[#2a2a2a] border-white/20 text-white focus:ring-0"
                />
                <span>Playlist Bersama Teman (Collaborative)</span>
              </label>
              {isCollaborativePlaylist && (
                <input 
                  type="text" 
                  value={collaboratorUsername}
                  onChange={(e) => setCollaboratorUsername(e.target.value)}
                  placeholder="Username teman (mis: @johndoe)..."
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white mt-1"
                />
              )}
            </div>

            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => setIsCreatePlaylistOpen(false)} className="flex-1 py-3 bg-[#2a2a2a] text-gray-300 font-semibold rounded-xl text-xs">Batal</button>
              <button type="submit" className="flex-1 py-3 bg-white text-black font-bold rounded-xl text-xs">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {isFullScreenSearch && (
  <TrendingModal 
    isOpen={isFullScreenSearch}
    onClose={() => setIsFullScreenSearch(false)}
    trendSongs={trendSongs}
    onPlaySong={(song: any, idx: number) => {
      playSong(song, trendSongs, idx);
      setIsFullScreenSearch(false);
    }}
    renderSongMenuButton={(song: any) => (
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          setSelectedSongForMenu(song); 
          setIsMenuOpen(true); 
        }} 
        className="p-2 text-gray-400 hover:text-white"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </button>
    )}
  />
)}

      {/* --- PLAYER & NAVIGASI BAWAH --- */}
      {currentTrack && !isPlayerOpen && (
        <MiniPlayer 
          currentTrack={currentTrack}
          isPlayerOpen={isPlayerOpen}
          setIsPlayerOpen={setIsPlayerOpen}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          playedProgress={playedProgress}
          togglePlay={togglePlay}
          toggleLikeSong={(song) => toggleLikeSong(song)}
          isSongLiked={(videoId) => likedSongIds.includes(videoId)}
        />
      )}

      {/* Full Player Overlay */}
      {currentTrack && isPlayerOpen && (
        <FullPlayer 
          isPlayerOpen={isPlayerOpen}
          setIsPlayerOpen={setIsPlayerOpen}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          playedProgress={playedProgress}
          playedSeconds={playedSeconds}
          duration={duration}
          togglePlay={togglePlay}
          handlePrev={handlePrev}
          handleNext={handleNext}
          handleSeek={handleSeek}
          toggleLikeSong={(song) => toggleLikeSong(song)}
          isSongLiked={(videoId) => likedSongIds.includes(videoId)}
          isShuffle={isShuffle}
          setIsShuffle={setIsShuffle}
          isRepeat={isRepeat}
          setIsRepeat={setIsRepeat}
          setSelectedSongForMenu={setSelectedSongForMenu}
          setIsMenuOpen={setIsMenuOpen}
          getHighResCover={getHighResCover}
          formatTime={formatTime}
          lyrics={lyrics}
          isLoadingLyrics={isLoadingLyrics}
          isLyricsExpanded={isLyricsExpanded}
          setIsLyricsExpanded={setIsLyricsExpanded}
          lyricLines={lyricLines}
          activeLineIndex={activeLineIndex}
          lyricContainerRef={lyricContainerRef}
          activeLyricRef={activeLyricRef}
        />
      )}
      
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 w-full h-[64px] bg-gradient-to-t from-black via-black/95 to-black/80 px-6 flex items-center justify-between z-40 pb-2 border-t border-white/5">
        <div onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'home' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-6 h-6" fill={activeTab === 'home' ? "currentColor" : "none"} stroke="currentColor" strokeWidth={activeTab === 'home' ? "0" : "2"} viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span className="text-[10px] font-medium">Home</span>
        </div>

        <div onClick={() => { setActiveTab('search'); setIsFullScreenSearch(false); }} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'search' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={activeTab === 'search' ? "3" : "2"} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span className="text-[10px] font-medium">Search</span>
        </div>

        <div onClick={() => setActiveTab('library')} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'library' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={activeTab === 'library' ? "3" : "2"} viewBox="0 0 24 24"><path d="M4 19V5a2 2 0 0 1 2-2h13.4a.5.5 0 0 1 .49.6l-1 5.2a.5.5 0 0 1-.49.4h-1.4"></path><path d="M4 19a2 2 0 0 0 2 2h14"></path><path d="M4 19h14"></path><path d="M8 12h8"></path><path d="M8 16h6"></path></svg>
          <span className="text-[10px] font-medium">Library</span>
        </div>

        <div onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'profile' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          <span className="text-[10px] font-medium">Profile</span>
        </div>
      </div>
    </div>
  );
}
