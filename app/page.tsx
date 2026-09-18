'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { chunkArray, generateRandomId } from '@/lib/utils';

import AuthScreen from '@/components/AuthScreen';
import TopHeader from '@/components/TopHeader';
import BottomNav from '@/components/BottomNav';
import MiniPlayer from '@/components/MiniPlayer';
import FullPlayer from '@/components/FullPlayer';
import ProfileView from '@/components/ProfileView';
import Modals from '@/components/Modals';

const ReactPlayer = dynamic(() => import('react-player/youtube'), { ssr: false });

export default function Home() {
  // --- AUTH & SUPABASE STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authInput, setAuthInput] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // --- USER PROFILE STATES ---
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

  // Followers / Following Modals
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);

  // Search User (@) States
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [viewingProfileCard, setViewingProfileCard] = useState<any | null>(null);
  const [viewingUserPlaylistsCount, setViewingUserPlaylistsCount] = useState(0);
  const [viewingUserFollowers, setViewingUserFollowers] = useState(0);
  const [viewingUserFollowing, setViewingUserFollowing] = useState(0);
  const [isFollowingSelectedUser, setIsFollowingSelectedUser] = useState(false);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [tempProfilePic, setTempProfilePic] = useState('');
  const [tempCoverPic, setTempCoverPic] = useState('');
  const [tempBio, setTempBio] = useState('');

  // --- APP NAVIGATION & STATES ---
  const [activeTab, setActiveTab] = useState('home'); 
  const [homeSubTab, setHomeSubTab] = useState<'all' | 'music' | 'podcast'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreenSearch, setIsFullScreenSearch] = useState(false);
  const [trendSongs, setTrendSongs] = useState<any[]>([]);

  // --- LIBRARY & PLAYLIST STATES ---
  const [likedSongIds, setLikedSongIds] = useState<string[]>([]);
  const [likedSongsList, setLikedSongsList] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);

  // Modal States
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCollaborativePlaylist, setIsCollaborativePlaylist] = useState(false);
  const [collaboratorUsername, setCollaboratorUsername] = useState('');
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState<any | null>(null);

  // --- PLAYER STATES ---
  const playerRef = useRef<any>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentQueue, setCurrentQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState<'off' | 'all' | 'one'>('off');

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedSongForMenu, setSelectedSongForMenu] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [playedProgress, setPlayedProgress] = useState(0); 
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const isSeekingRef = useRef(false);

  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);
  
  const lyricContainerRef = useRef<HTMLDivElement>(null);
  const activeLyricRef = useRef<HTMLDivElement>(null);

  // --- INITIALIZATION ---
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

    setHistory(JSON.parse(localStorage.getItem('icarus_history') || '[]'));
    setLikedSongIds(JSON.parse(localStorage.getItem('icarus_liked_ids') || '[]'));
    setLikedSongsList(JSON.parse(localStorage.getItem('icarus_liked_full') || '[]'));
    setPlaylists(JSON.parse(localStorage.getItem('icarus_playlists') || '[]'));

    loadHomepageData();
  }, []);

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

  const loadHomepageData = async () => {
    setIsLoading(true);
    try {
      const res1 = await fetch(`/api/search?q=Global Viral Hits 2026`);
      const json1 = await res1.json();
      if (json1.status === 'success') setSuggestions(json1.data.slice(0, 15));

      const res3 = await fetch(`/api/search?q=Top Chart Trending Songs`);
      const json3 = await res3.json();
      if (json3.status === 'success') setTrendSongs(json3.data.slice(0, 15));
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleDeviceFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    previewSetter: (value: string) => void,
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

  const isSongPlayedBefore = (videoId: string) => {
    return history.some((h: any) => h.videoId === videoId);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!authInput || !authPassword) {
      setAuthError("Semua kolom harus diisi!");
      return;
    }

    try {
      if (authMode === 'register') {
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
        }
        setToastMessage("Akun berhasil dibuat & terdaftar di Supabase!");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authInput,
          password: authPassword,
        });
        if (error) throw error;
        if (data.user) {
          setUserEmail(data.user.email || '');
          await fetchSupabaseProfile(data.user.id, data.user.email || '');
        }
        setToastMessage("Berhasil masuk!");
      }

      localStorage.setItem('icarus_logged_in', 'true');
      localStorage.setItem('icarus_email', authInput);
      setIsLoggedIn(true);
    } catch (err: any) {
      setAuthError(err.message || "Terjadi kesalahan autentikasi.");
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
    setToastMessage("Berhasil keluar akun.");
  };

  const uploadProfileImage = async (file: File, userUid: string, type: 'avatar' | 'cover') => {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${userUid}/${type}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false, contentType: file.type });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('profile-images').getPublicUrl(filePath);
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

  const playSong = (song: any, queue: any[] = [], index: number = 0) => {
    setCurrentTrack(song);
    const activeQueue = queue.length > 0 ? queue : (suggestions.length > 0 ? suggestions : [song]);
    const activeIndex = queue.length > 0 ? index : activeQueue.findIndex((s: any) => s.videoId === song.videoId);
    
    setCurrentQueue(activeQueue);
    setCurrentIndex(activeIndex >= 0 ? activeIndex : 0);

    setIsPlaying(true);
    setIsBuffering(true);
    setPlayedProgress(0);
    setPlayedSeconds(0);

    const newHistory = [song, ...history.filter(s => s.videoId !== song.videoId)].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('icarus_history', JSON.stringify(newHistory));
  };

  const handleNext = () => {
    if (isRepeat === 'one' && currentTrack) {
      if (playerRef.current) playerRef.current.seekTo(0, 'seconds');
      return;
    }
    if (currentQueue.length > 0) {
      let nextIdx = isShuffle ? Math.floor(Math.random() * currentQueue.length) : (currentIndex + 1) % currentQueue.length;
      playSong(currentQueue[nextIdx], currentQueue, nextIdx);
    }
  };

  const handlePrev = () => {
    if (currentQueue.length > 0) {
      const prevIdx = (currentIndex - 1 + currentQueue.length) % currentQueue.length;
      playSong(currentQueue[prevIdx], currentQueue, prevIdx);
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); 
    if (currentTrack) setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || !playerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetSeconds = percentage * duration;
    isSeekingRef.current = true;
    setPlayedProgress(percentage);
    setPlayedSeconds(targetSeconds);
    playerRef.current.seekTo(targetSeconds, 'seconds');
    setTimeout(() => { isSeekingRef.current = false; }, 800);
  };

  const toggleFollowUser = async () => {
    if (!viewingProfileCard || !userId) {
      setToastMessage('Data user belum siap.');
      return;
    }

    const targetNumericId = viewingProfileCard.numeric_id;
    if (!targetNumericId) {
      setToastMessage('User target belum memiliki numeric ID.');
      return;
    }

    if (String(userId) === String(targetNumericId)) {
      setToastMessage('Kamu tidak bisa follow diri sendiri.');
      return;
    }

    const followerId = String(userId);
    const followingId = String(targetNumericId);

    if (isFollowingSelectedUser) {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) {
        setToastMessage(`Gagal unfollow: ${error.message}`);
        return;
      }

      setIsFollowingSelectedUser(false);
      setViewingUserFollowers(prev => Math.max(0, prev - 1));
      setToastMessage(`Berhasil Unfollow @${viewingProfileCard.username}`);
    } else {
      const { error } = await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId });

      if (error) {
        if (error.code === '23505') setToastMessage('Kamu sudah mengikuti user ini.');
        else setToastMessage(`Gagal follow: ${error.message}`);
        return;
      }

      setIsFollowingSelectedUser(true);
      setViewingUserFollowers(prev => prev + 1);
      setToastMessage(`Berhasil Mengikuti @${viewingProfileCard.username}!`);
    }

    await fetchFollowData(followerId);
  };

  const removeFollowerFromList = async (followerNumericId: string) => {
    if (!userId) return;
    const { error } = await supabase.from('follows').delete().eq('follower_id', String(followerNumericId)).eq('following_id', String(userId));
    if (error) {
      setToastMessage(`Gagal menghapus follower: ${error.message}`);
      return;
    }
    setFollowersList(prev => prev.filter(user => String(user.numeric_id) !== String(followerNumericId)));
    setFollowersCount(prev => Math.max(0, prev - 1));
    setToastMessage('Follower berhasil dihapus.');
  };

  const unfollowFromList = async (followingNumericId: string) => {
    if (!userId) return;
    const { error } = await supabase.from('follows').delete().eq('follower_id', String(userId)).eq('following_id', String(followingNumericId));
    if (error) {
      setToastMessage(`Gagal unfollow: ${error.message}`);
      return;
    }
    setFollowingList(prev => prev.filter(user => String(user.numeric_id) !== String(followingNumericId)));
    setFollowingCount(prev => Math.max(0, prev - 1));
    setToastMessage('Berhasil unfollow.');
  };

  const renderSongMenuButton = (song: any) => (
    <button 
      onClick={(ev) => {
        ev.stopPropagation();
        setSelectedSongForMenu(song);
        setIsMenuOpen(true);
      }} 
      className="p-1.5 text-gray-400 hover:text-white transition-colors"
      title="Opsi Lagu"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
      </svg>
    </button>
  );

  const displayedSuggestions = suggestions.filter((song: any) => {
    const title = (song.title || '').toLowerCase();
    const isPodcast = title.includes('podcast') || title.includes('talk') || title.includes('episode') || title.includes('interview');
    if (homeSubTab === 'music') return !isPodcast;
    if (homeSubTab === 'podcast') return isPodcast;
    return true;
  });

  const suggestionColumns = chunkArray(displayedSuggestions, 5);

  if (!isLoggedIn) {
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
    <div className="bg-black min-h-screen text-white font-sans selection:bg-gray-700">
      
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-white text-black font-semibold px-4 py-2 rounded-full shadow-2xl z-[100] text-xs animate-bounce">
          {toastMessage}
        </div>
      )}

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
            onEnded={handleNext}
            volume={1}
            width="100%"
            height="100%"
          />
        </div>
      )}

      {activeTab === 'home' && (
        <TopHeader
          setActiveTab={setActiveTab}
          homeSubTab={homeSubTab}
          setHomeSubTab={setHomeSubTab}
          renderAvatar={renderAvatar}
        />
      )}

      <div className="pb-32 px-4 pt-2 overflow-y-auto">
        {/* --- TAB: HOME --- */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-8 animate-fade-in">
            <section>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Jump into a session based on your tastes</p>
                  <h2 className="text-2xl font-bold tracking-tight">Start listening</h2>
                </div>
                <button 
                  onClick={() => setIsFullScreenSearch(true)}
                  className="text-xs font-semibold text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
                >
                  Show All
                </button>
              </div>

              {isLoading ? (
                <div className="text-sm text-gray-500 animate-pulse">Curating your mix...</div>
              ) : (
                <div className="flex overflow-x-auto gap-4 pb-2 snap-x scrollbar-none pr-12">
                  {suggestionColumns.map((column, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-2 min-w-[330px] max-w-[350px] flex-shrink-0 snap-start bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 shadow-lg">
                      {column.map((song: any, songIdx: number) => {
                        const globalIdx = colIdx * 5 + songIdx;
                        const artistName = song.artists?.map((a: any) => a.name).join(', ') || '';
                        const liked = isSongLiked(song.videoId);
                        const playedBefore = isSongPlayedBefore(song.videoId);

                        return (
                          <div 
                            key={songIdx} 
                            onClick={() => playSong(song, displayedSuggestions, globalIdx)} 
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 cursor-pointer group transition-all"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-12 h-12 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden relative shadow-inner">
                                 {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
                                 {currentTrack?.videoId === song.videoId && isPlaying && (
                                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                     <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                                   </div>
                                 )}
                              </div>
                              <div className="flex flex-col overflow-hidden pr-2">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-base font-medium truncate w-32 ${currentTrack?.videoId === song.videoId ? 'text-green-400 font-bold' : 'text-white'}`}>
                                    {song.title}
                                  </span>
                                  {playedBefore && (
                                    <span className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center text-[10px] text-white flex-shrink-0" title="Pernah diputar">
                                      ✓
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm text-gray-400 truncate w-36">{artistName}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={(e) => toggleLikeSong(song, e)} className="p-1">
                                {liked ? (
                                  <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                ) : (
                                  <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                                )}
                              </button>
                              {renderSongMenuButton(song)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* --- TAB: PROFILE --- */}
        {activeTab === 'profile' && (
          <ProfileView
            coverPic={coverPic}
            renderAvatar={renderAvatar}
            username={username}
            isVerified={isVerified}
            userId={userId}
            userEmail={userEmail}
            bio={bio}
            isEditingProfile={isEditingProfile}
            setIsEditingProfile={setIsEditingProfile}
            setTempUsername={setTempUsername}
            setTempProfilePic={setTempProfilePic}
            setTempCoverPic={setTempCoverPic}
            setTempBio={setTempBio}
            handleSaveProfile={handleSaveProfile}
            tempUsername={tempUsername}
            tempBio={tempBio}
            handleDeviceFileUpload={handleDeviceFileUpload}
            setProfilePicFile={setProfilePicFile}
            setCoverPicFile={setCoverPicFile}
            isSavingProfile={isSavingProfile}
            likedSongsList={likedSongsList}
            playlists={playlists}
            followersCount={followersCount}
            followingCount={followingCount}
            setIsFollowersModalOpen={setIsFollowersModalOpen}
            setIsFollowingModalOpen={setIsFollowingModalOpen}
            handleLogout={handleLogout}
            profilePic={profilePic}
          />
        )}
      </div>

      <MiniPlayer
        currentTrack={currentTrack}
        isPlayerOpen={isPlayerOpen}
        setIsPlayerOpen={setIsPlayerOpen}
        toggleLikeSong={toggleLikeSong}
        isSongLiked={isSongLiked}
        togglePlay={togglePlay}
        isBuffering={isBuffering}
        isPlaying={isPlaying}
        playedProgress={playedProgress}
      />

      <FullPlayer
        currentTrack={currentTrack}
        isPlayerOpen={isPlayerOpen}
        setIsPlayerOpen={setIsPlayerOpen}
        setSelectedSongForMenu={setSelectedSongForMenu}
        setIsMenuOpen={setIsMenuOpen}
        toggleLikeSong={toggleLikeSong}
        isSongLiked={isSongLiked}
        handleSeek={handleSeek}
        playedProgress={playedProgress}
        playedSeconds={playedSeconds}
        duration={duration}
        isShuffle={isShuffle}
        setIsShuffle={setIsShuffle}
        isRepeat={isRepeat}
        setIsRepeat={setIsRepeat}
        handlePrev={handlePrev}
        handleNext={handleNext}
        togglePlay={togglePlay}
        isBuffering={isBuffering}
        isPlaying={isPlaying}
        isLyricsExpanded={isLyricsExpanded}
        setIsLyricsExpanded={setIsLyricsExpanded}
        isLoadingLyrics={isLoadingLyrics}
        lyricLines={lyricLines}
        activeLineIndex={activeLineIndex}
        lyricContainerRef={lyricContainerRef}
        activeLyricRef={activeLyricRef}
      />

      <Modals
        viewingProfileCard={viewingProfileCard}
        setViewingProfileCard={setViewingProfileCard}
        renderAvatar={renderAvatar}
        viewingUserPlaylistsCount={viewingUserPlaylistsCount}
        viewingUserFollowers={viewingUserFollowers}
        viewingUserFollowing={viewingUserFollowing}
        toggleFollowUser={toggleFollowUser}
        isFollowingSelectedUser={isFollowingSelectedUser}
        isFollowersModalOpen={isFollowersModalOpen}
        setIsFollowersModalOpen={setIsFollowersModalOpen}
        followersCount={followersCount}
        followersList={followersList}
        removeFollowerFromList={removeFollowerFromList}
        isFollowingModalOpen={isFollowingModalOpen}
        setIsFollowingModalOpen={setIsFollowingModalOpen}
        followingCount={followingCount}
        followingList={followingList}
        unfollowFromList={unfollowFromList}
        isFullScreenSearch={isFullScreenSearch}
        setIsFullScreenSearch={setIsFullScreenSearch}
        trendSongs={trendSongs}
        playSong={playSong}
        renderSongMenuButton={renderSongMenuButton}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        selectedSongForMenu={selectedSongForMenu}
        currentTrack={currentTrack}
        setSongToAddToPlaylist={setSongToAddToPlaylist}
        setIsAddToPlaylistOpen={setIsAddToPlaylistOpen}
        toggleLikeSong={toggleLikeSong}
        isSongLiked={isSongLiked}
        setToastMessage={setToastMessage}
        isAddToPlaylistOpen={isAddToPlaylistOpen}
        setIsCreatePlaylistOpen={setIsCreatePlaylistOpen}
        playlists={playlists}
        addSongToPlaylist={addSongToPlaylist}
        isCreatePlaylistOpen={isCreatePlaylistOpen}
        handleCreatePlaylist={handleCreatePlaylist}
        newPlaylistName={newPlaylistName}
        setNewPlaylistName={setNewPlaylistName}
        isCollaborativePlaylist={isCollaborativePlaylist}
        setIsCollaborativePlaylist={setIsCollaborativePlaylist}
        collaboratorUsername={collaboratorUsername}
        setCollaboratorUsername={setCollaboratorUsername}
      />

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setIsFullScreenSearch={setIsFullScreenSearch}
      />
    </div>
  );
}
