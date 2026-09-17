'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ReactPlayer = dynamic(() => import('react-player/youtube'), { ssr: false });

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

const chunkArray = (arr: any[], size: number) => {
  const chunked = [];
  for (let i = 0; i < arr.length; i += size) {
    chunked.push(arr.slice(i, i + size));
  }
  return chunked;
};

const generateRandomId = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

export default function Home() {
  // --- AUTH & SUPABASE STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authInput, setAuthInput] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // --- USER PROFILE STATES ---
  const [userId, setUserId] = useState(''); // Numeric Random ID (e.g., 1234567890)
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
  const [randomSongs, setRandomSongs] = useState<any[]>([]);
  const [randomSongsLimit, setRandomSongsLimit] = useState<number>(5);
  const [history, setHistory] = useState<any[]>([]);
  const [historyDisplayLimit, setHistoryDisplayLimit] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreenSearch, setIsFullScreenSearch] = useState(false);
  const [trendSongs, setTrendSongs] = useState<any[]>([]);

  // --- LIBRARY & PLAYLIST STATES ---
  const [likedSongIds, setLikedSongIds] = useState<string[]>([]);
  const [likedSongsList, setLikedSongsList] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<{ id: string; name: string; songs: any[]; isCollaborative?: boolean; collaborator?: string; addedBy?: { [songId: string]: string } }[]>([]);
  const [activePlaylistView, setActivePlaylistView] = useState<any | null>(null);

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

  // --- SUPABASE SESSION & DATA INITIALIZATION ---
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

  // Fetch Followers & Following Data from Supabase
  const fetchFollowData = async (targetNumericId: string) => {
    try {
      // Get Followers List
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

      // Get Following List
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

  // Hanya digunakan sebagai preview di browser.
  // File aslinya nanti di-upload ke Supabase Storage saat tombol simpan ditekan.
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

  // --- AUTH SUBMIT (Supabase Integration) ---
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

  const uploadProfileImage = async (
  file: File,
  userUid: string,
  type: 'avatar' | 'cover'
) => {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `${userUid}/${type}-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('profile-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw uploadError;
  }

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
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;

    if (!user) {
      setToastMessage('Session Supabase tidak ditemukan. Silakan login kembali.');
      return;
    }

    let savedProfilePic = tempProfilePic;
    let savedCoverPic = tempCoverPic;

    if (profilePicFile) {
      savedProfilePic = await uploadProfileImage(
        profilePicFile,
        user.id,
        'avatar'
      );
    }

    if (coverPicFile) {
      savedCoverPic = await uploadProfileImage(
        coverPicFile,
        user.id,
        'cover'
      );
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
      .upsert(profilePayload, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (profileError) {
      throw profileError;
    }

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
    setToastMessage(
      error?.message || 'Gagal menyimpan profil ke Supabase.'
    );
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

  const getContributorStats = (playlist: any) => {
    if (!playlist.songs || playlist.songs.length === 0) return [];
    const counts: { [key: string]: number } = {};
    const total = playlist.songs.length;
    playlist.songs.forEach((song: any) => {
      const u = playlist.addedBy?.[song.videoId] || username || 'Owner';
      counts[u] = (counts[u] || 0) + 1;
    });
    return Object.keys(counts).map(user => ({
      user,
      percentage: Math.round((counts[user] / total) * 100)
    }));
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsLoading(true);

    if (searchQuery.startsWith('@')) {
      const usernameQuery = searchQuery.replace('@', '').trim();
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .ilike('username', `%${usernameQuery}%`);
        if (data) {
          setUserSearchResults(data);
          setSearchResults([]);
        }
      } catch (err) {
        console.error("User search error:", err);
      }
    } else {
      setUserSearchResults([]);
      try {
        const res = await fetch(`/api/search?q=${searchQuery}`);
        const json = await res.json();
        if (json.status === 'success') setSearchResults(json.data);
      } catch (e) { console.error(e); }
    }
    setIsLoading(false);
  };

  // Open User Profile Card & Load Statistics
  const openUserProfileCard = async (targetUser: any) => {
    setViewingProfileCard(targetUser);
    const targetNumericId = targetUser.numeric_id || targetUser.id;

    // Check if following
    if (userId && targetNumericId) {
      const { data } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', userId)
        .eq('following_id', targetNumericId)
        .maybeSingle();
      setIsFollowingSelectedUser(!!data);
    }

    // Get Target Followers & Following Counts
    const { data: targetFollowers } = await supabase.from('follows').select('*').eq('following_id', targetNumericId);
    const { data: targetFollowing } = await supabase.from('follows').select('*').eq('follower_id', targetNumericId);

    setViewingUserFollowers(targetFollowers?.length || 0);
    setViewingUserFollowing(targetFollowing?.length || 0);
    setViewingUserPlaylistsCount(Math.floor(Math.random() * 8) + 1); // Mock playlist count
  };

  // Follow / Unfollow logic with Supabase Database
  const toggleFollowUser = async () => {
    if (!viewingProfileCard || !userId) return;
    const targetNumericId = viewingProfileCard.numeric_id || viewingProfileCard.id;

    if (isFollowingSelectedUser) {
      // Unfollow
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', userId)
        .eq('following_id', targetNumericId);

      setIsFollowingSelectedUser(false);
      setViewingUserFollowers(prev => Math.max(0, prev - 1));
      setToastMessage(`Berhasil Unfollow @${viewingProfileCard.username}`);
    } else {
      // Follow
      await supabase
        .from('follows')
        .insert({
          follower_id: userId,
          following_id: targetNumericId
        });

      setIsFollowingSelectedUser(true);
      setViewingUserFollowers(prev => prev + 1);
      setToastMessage(`Berhasil Mengikuti @${viewingProfileCard.username}!`);
    }

    // Refresh own follow data
    fetchFollowData(userId);
  };

  // Helper render tombol Titik Tiga Modal pada lagu
  const renderSongMenuButton = (song: any, e?: React.MouseEvent) => {
    return (
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
  };

  const displayedSuggestions = suggestions.filter((song: any) => {
    const title = (song.title || '').toLowerCase();
    const isPodcast = title.includes('podcast') || title.includes('talk') || title.includes('episode') || title.includes('interview');
    if (homeSubTab === 'music') return !isPodcast;
    if (homeSubTab === 'podcast') return isPodcast;
    return true;
  });

  const suggestionColumns = chunkArray(displayedSuggestions, 5);
  const recentlyPlayedColumns = chunkArray(history, 5);

  if (!isLoggedIn) {
    return (
      <div className="bg-black min-h-screen text-white flex flex-col justify-center items-center p-6 font-sans">
        <div className="w-full max-w-sm bg-[#121212] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">ICARUS</h1>
            <p className="text-xs text-gray-400">Your Ultimate Vibe & Music Space</p>
          </div>

          <div className="flex bg-black/50 p-1 rounded-xl mb-6 border border-white/5">
            <button 
              onClick={() => { setAuthMode('login'); setAuthError(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${authMode === 'login' ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Masuk
            </button>
            <button 
              onClick={() => { setAuthMode('register'); setAuthError(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${authMode === 'register' ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Daftar
            </button>
          </div>

          {authError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-4 text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Email Akun / Nomor Telpon</label>
              <input 
                type="text" 
                value={authInput}
                onChange={(e) => setAuthInput(e.target.value)}
                placeholder="nama@email.com / 08123456789"
                className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white focus:outline-none focus:border-white transition-colors"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full mt-2 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-transform active:scale-[0.98]">
              {authMode === 'login' ? 'Masuk' : 'Daftar Akun'}
            </button>
          </form>
        </div>
      </div>
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
        <div className="sticky top-0 bg-black/90 backdrop-blur-md z-40 px-4 py-4 flex gap-3 items-center">
          <div onClick={() => setActiveTab('profile')} className="cursor-pointer">
            {renderAvatar("w-8 h-8 text-xs font-bold")}
          </div>
          <button 
            onClick={() => setHomeSubTab('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${homeSubTab === 'all' ? 'bg-white text-black' : 'bg-[#242424] text-white hover:bg-[#303030]'}`}
          >
            All
          </button>
          <button 
            onClick={() => setHomeSubTab('music')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${homeSubTab === 'music' ? 'bg-white text-black' : 'bg-[#242424] text-white hover:bg-[#303030]'}`}
          >
            Music
          </button>
          <button 
            onClick={() => setHomeSubTab('podcast')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${homeSubTab === 'podcast' ? 'bg-white text-black' : 'bg-[#242424] text-white hover:bg-[#303030]'}`}
          >
            Podcasts
          </button>
        </div>
      )}

      <div className="pb-32 px-4 pt-2 overflow-y-auto">
        
        {/* --- TAB: HOME --- */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-8 animate-fade-in">
            
            {/* Start Listening Carousel */}
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

            {/* Recently Played Carousel (Diganit Centang Abu-abu menggantikan Love, + Titik Tiga Modal) */}
            {history.length > 0 && (
              <section className="mt-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold tracking-tight">Recently Played</h2>
                </div>
                <div className="flex overflow-x-auto gap-4 pb-2 snap-x scrollbar-none pr-12">
                  {recentlyPlayedColumns.map((column, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-2 min-w-[330px] max-w-[350px] flex-shrink-0 snap-start bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 shadow-lg">
                      {column.map((song: any, songIdx: number) => {
                        const globalIdx = colIdx * 5 + songIdx;
                        const artistName = song.artists?.map((a: any) => a.name).join(', ') || '';

                        return (
                          <div 
                            key={songIdx} 
                            onClick={() => playSong(song, history, globalIdx)} 
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 cursor-pointer group transition-all"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-12 h-12 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden relative shadow-inner">
                                 {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
                              </div>
                              <div className="flex flex-col overflow-hidden pr-2">
                                <span className="text-base font-medium truncate w-32 text-white">{song.title}</span>
                                <span className="text-sm text-gray-400 truncate w-36">{artistName}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {/* Centang Abu-Abu (Pengganti Love Khusus Recently Played) */}
                              <span className="w-6 h-6 rounded-full bg-gray-700/60 text-gray-400 flex items-center justify-center text-xs font-bold" title="Pernah diputar">
                                ✓
                              </span>
                              {renderSongMenuButton(song)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Vibes For You */}
            <section className="mt-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold tracking-tight">Vibes For You</h2>
              </div>
              <div className="flex flex-col gap-1">
                {randomSongs.slice(0, randomSongsLimit).map((song: any, idx: number) => {
                  const artistName = song.artists?.map((a: any) => a.name).join(', ') || '';
                  const liked = isSongLiked(song.videoId);
                  const playedBefore = isSongPlayedBefore(song.videoId);

                  return (
                    <div 
                      key={idx} 
                      onClick={() => playSong(song, randomSongs, idx)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-12 h-12 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden relative">
                           {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-white truncate">{song.title}</span>
                            {playedBefore && (
                              <span className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center text-[10px] text-white flex-shrink-0" title="Pernah diputar">
                                ✓
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 truncate">{artistName}</span>
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

                {randomSongsLimit < randomSongs.length && (
                  <button 
                    onClick={() => setRandomSongsLimit(prev => Math.min(prev + 5, randomSongs.length))}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-colors mt-2"
                  >
                    Show More
                  </button>
                )}
              </div>
            </section>

          </div>
        )}

        {/* --- TAB: SEARCH --- */}
        {activeTab === 'search' && (
          <div className="animate-fade-in pt-4">
            <h1 className="text-3xl font-bold mb-4">Search</h1>
            <form onSubmit={handleSearch} className="mb-6 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value.trim()) {
                    setSearchResults([]);
                    setUserSearchResults([]);
                  }
                }}
                className="w-full bg-white text-black font-semibold pl-10 pr-10 py-3 rounded-md focus:outline-none placeholder-gray-500" 
                placeholder="Cari lagu atau gunakan '@username'..." 
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setUserSearchResults([]);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-black hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              )}
            </form>

            {userSearchResults.length > 0 ? (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Akun Pengguna Ditemukan</h3>
                {userSearchResults.map((usr: any) => (
                  <div 
                    key={usr.id} 
                    onClick={() => openUserProfileCard(usr)}
                    className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-full overflow-hidden flex items-center justify-center font-bold">
                        {usr.profile_pic ? <img src={usr.profile_pic} className="w-full h-full object-cover" /> : usr.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">@{usr.username}</h4>
                        <span className="text-[10px] text-gray-400">ID: {usr.numeric_id || usr.id}</span>
                      </div>
                    </div>
                    <span className="text-xs bg-white text-black px-3 py-1.5 rounded-full font-semibold">Lihat Profil</span>
                  </div>
                ))}
              </div>
            ) : !searchQuery.trim() && searchResults.length === 0 ? (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Recent History</h3>
                  <div className="flex flex-col gap-1">
                    {history.slice(0, historyDisplayLimit).map((song: any, idx: number) => (
                      <div key={idx} onClick={() => playSong(song, history, idx)} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                            {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-white truncate">{song.title}</span>
                            <span className="w-3.5 h-3.5 bg-gray-600 rounded-full flex items-center justify-center text-[9px] text-white flex-shrink-0">✓</span>
                          </div>
                        </div>
                        {renderSongMenuButton(song)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                 {isLoading ? (
                    <div className="text-center text-gray-400 mt-10">Searching...</div>
                 ) : searchResults.length > 0 ? (
                   searchResults.map((song, idx) => (
                     <div key={idx} onClick={() => playSong(song, searchResults, idx)} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-14 h-14 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden shadow-inner">
                             {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-base font-semibold text-white truncate">{song.title}</span>
                            <span className="text-sm text-gray-400 truncate">Track • {song.artists?.map((a: any) => a.name).join(', ')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={(e) => toggleLikeSong(song, e)} className="p-2">
                            {isSongLiked(song.videoId) ? (
                              <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                            ) : (
                              <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                            )}
                          </button>
                          {renderSongMenuButton(song)}
                        </div>
                     </div>
                   ))
                 ) : (
                    <div className="text-center text-gray-500 mt-10">Tidak ada hasil ditemukan</div>
                 )}
              </div>
            )}
          </div>
        )}

        {/* --- TAB: LIBRARY --- */}
        {activeTab === 'library' && (
          <div className="animate-fade-in pt-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Your Library</h1>
              <button 
                onClick={() => setIsCreatePlaylistOpen(true)}
                className="bg-white text-black font-semibold text-xs px-4 py-2 rounded-full hover:bg-gray-200 transition-colors shadow"
              >
                + Buat Playlist
              </button>
            </div>

            {activePlaylistView ? (
              <div className="flex flex-col gap-4">
                <button onClick={() => setActivePlaylistView(null)} className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1">
                  ← Kembali ke Library
                </button>
                <div className="bg-gradient-to-b from-gray-800 to-black p-6 rounded-2xl mb-2 flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-black mb-1">{activePlaylistView.name}</h2>
                    <p className="text-xs text-gray-400">{activePlaylistView.songs.length} lagu di dalam playlist ini</p>
                    {activePlaylistView.isCollaborative && (
                      <div className="mt-2 flex flex-col gap-1">
                        <span className="text-[11px] text-purple-400 font-bold">🤝 Collaborative Playlist (Shared with @{activePlaylistView.collaborator || 'Friend'})</span>
                        <div className="flex gap-2 text-[10px] text-gray-300">
                          {getContributorStats(activePlaylistView).map((stat: any, sIdx: number) => (
                            <span key={sIdx} className="bg-white/10 px-2 py-0.5 rounded">
                              {stat.user}: {stat.percentage}%
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {activePlaylistView.name !== 'Liked Songs' && (
                    <button 
                      onClick={(e) => deletePlaylist(activePlaylistView.id, e)}
                      className="bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                    >
                      Hapus Playlist
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  {activePlaylistView.songs.length > 0 ? (
                    activePlaylistView.songs.map((song: any, idx: number) => (
                      <div key={idx} onClick={() => playSong(song, activePlaylistView.songs, idx)} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                            {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-semibold truncate">{song.title}</span>
                            <span className="text-xs text-gray-400 truncate">
                              {song.artists?.map((a: any) => a.name).join(', ')} 
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {activePlaylistView.name === 'Liked Songs' ? (
                            <button onClick={(e) => toggleLikeSong(song, e)} className="p-1 text-white fill-white">
                              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                            </button>
                          ) : (
                            <button 
                              onClick={(e) => removeSongFromPlaylist(activePlaylistView.id, song.videoId, e)} 
                              className="text-gray-400 hover:text-red-400 text-xs px-2 py-1 bg-white/5 rounded-lg"
                              title="Hapus dari playlist"
                            >
                              Unplaylist
                            </button>
                          )}
                          {renderSongMenuButton(song)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-10 text-sm">Playlist ini masih kosong.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div 
                  onClick={() => setActivePlaylistView({ name: 'Liked Songs', songs: likedSongsList })}
                  className="bg-gradient-to-r from-purple-900/60 to-indigo-900/40 border border-white/10 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-transform shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-white fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">Liked Songs</h3>
                      <p className="text-xs text-gray-300">{likedSongsList.length} lagu disukai</p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm font-bold">→</span>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Playlist Kamu</h3>
                  {playlists.length > 0 ? (
                    playlists.map((pl) => (
                      <div 
                        key={pl.id} 
                        className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors"
                      >
                        <div onClick={() => setActivePlaylistView(pl)} className="flex items-center gap-3 flex-1 cursor-pointer overflow-hidden">
                          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center font-bold text-lg text-gray-400 flex-shrink-0">
                            {pl.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-semibold text-white truncate">{pl.name}</h4>
                            <p className="text-xs text-gray-400 truncate">
                              {pl.songs.length} lagu {pl.isCollaborative && '• 🤝 Collaborative'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 italic">Belum ada playlist kustom.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: PROFILE (Dengan ID Angka Acak & Sync Supabase Presisi) --- */}
        {activeTab === 'profile' && (
          <div className="animate-fade-in pb-12 flex flex-col items-center">
            <div className="w-full max-w-md bg-[#121212]/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md relative pb-8">
              
              {/* Cover Banner */}
              <div className="w-full h-52 relative overflow-hidden bg-gray-900">
                {coverPic ? (
                  <img src={coverPic} alt="Cover" className="w-full h-full object-cover scale-110 translate-y-2" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-purple-950 via-gray-900 to-black scale-110 translate-y-2 opacity-90" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-[#121212]" />
              </div>

              {/* Profile Avatar */}
              <div className="px-6 flex flex-col items-center relative -mt-16 z-10">
                <div className="mb-3">
                  {renderAvatar("w-24 h-24 text-2xl font-bold")}
                </div>

                <div className="flex items-center gap-1.5 mb-1">
                  <h2 className="text-2xl font-bold text-white">{username || 'User Icarus'}</h2>
                  {isVerified && (
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow" title="Verified Account">
                      ✓
                    </span>
                  )}
                </div>

                {/* ID Angka acak tersimpan di Supabase */}
                <p className="text-[11px] font-mono text-gray-400 mb-0.5">ID: {userId || '1234567890'}</p>
                <p className="text-xs text-gray-400 mb-3">{userEmail || 'user@icarus.music'}</p>

                {/* Bio Display */}
                <p className="text-xs text-gray-300 text-center max-w-xs mb-5 italic bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                  &ldquo;{bio}&rdquo;
                </p>

                {!isEditingProfile ? (
                  <button 
                    onClick={() => {
                      setTempUsername(username);
                      setTempProfilePic(profilePic);
                      setTempCoverPic(coverPic);
                      setTempBio(bio);
                      setIsEditingProfile(true);
                    }}
                    className="bg-white text-black font-bold text-xs px-6 py-2.5 rounded-full hover:bg-gray-200 transition-transform active:scale-95 shadow-md mb-6"
                  >
                    Edit Profil
                  </button>
                ) : (
                  <form onSubmit={handleSaveProfile} className="w-full flex flex-col gap-4 bg-[#1a1a1a] border border-white/10 p-5 rounded-2xl mb-6 shadow-2xl animate-fade-in">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Edit Profil & Cloud Sync</h3>
                      <button type="button" onClick={() => setIsEditingProfile(false)} className="text-xs text-gray-400 hover:text-white">Batal</button>
                    </div>
                    
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Username</label>
                      <input 
                        type="text" 
                        value={tempUsername}
                        onChange={(e) => setTempUsername(e.target.value)}
                        placeholder="Masukkan username..."
                        className="w-full bg-[#242424] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Bio</label>
                      <textarea 
                        value={tempBio}
                        onChange={(e) => setTempBio(e.target.value)}
                        placeholder="Tulis bio singkat..."
                        className="w-full bg-[#242424] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white resize-none h-20"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Foto Profil (Device)</label>
                      <input
  type="file"
  accept="image/jpeg,image/png,image/webp,image/gif"
  onChange={(e) =>
    handleDeviceFileUpload(
      e,
      setTempProfilePic,
      setProfilePicFile
    )
  }
  className="w-full text-xs text-gray-400 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-semibold file:text-black"
/>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Cover / Banner (Device)</label>
                      <input
  type="file"
  accept="image/jpeg,image/png,image/webp,image/gif"
  onChange={(e) =>
    handleDeviceFileUpload(
      e,
      setTempCoverPic,
      setCoverPicFile
    )
  }
  className="w-full text-xs text-gray-400 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-semibold file:text-black"
/>
                    </div>

                    <button type="submit" className="py-2.5 bg-white text-black font-bold rounded-xl text-xs hover:bg-gray-200 transition-colors mt-2">
                      Simpan ke Supabase Database
                    </button>
                  </form>
                )}

                {/* Followers & Following Stats */}
                <div className="grid grid-cols-4 gap-2 w-full bg-white/5 border border-white/10 rounded-2xl p-3 mb-6 text-center shadow-lg">
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-white">{likedSongsList.length}</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">Songs</span>
                  </div>
                  <div className="flex flex-col border-l border-white/10">
                    <span className="text-base font-bold text-white">{playlists.length}</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">Playlists</span>
                  </div>
                  <div onClick={() => setIsFollowersModalOpen(true)} className="flex flex-col border-l border-white/10 cursor-pointer hover:bg-white/5 rounded-lg py-1">
                    <span className="text-base font-bold text-white">{followersCount}</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">Followers</span>
                  </div>
                  <div onClick={() => setIsFollowingModalOpen(true)} className="flex flex-col border-l border-white/10 cursor-pointer hover:bg-white/5 rounded-lg py-1">
                    <span className="text-base font-bold text-white">{followingCount}</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">Following</span>
                  </div>
                </div>

                <div className="w-full flex flex-col gap-3">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-300">Cloud Database Sync</span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      Supabase Active
                    </span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full py-3.5 bg-red-600/20 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-colors mt-2"
                  >
                    Keluar Akun (Logout)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- MODAL: VIEW OTHER USER PROFILE CARD (Lengkap tanpa memperlihatkan Email) --- */}
      {viewingProfileCard && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setViewingProfileCard(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-[#121212] border border-white/10 w-full max-w-sm rounded-3xl overflow-hidden flex flex-col items-center text-center shadow-2xl relative pb-6">
            
            {/* Header Cover Banner */}
            <div className="w-full h-32 relative bg-gray-900">
              {viewingProfileCard.cover_pic ? (
                <img src={viewingProfileCard.cover_pic} className="w-full h-full object-cover scale-105" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-900 via-gray-800 to-black" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121212]" />
              <button onClick={() => setViewingProfileCard(null)} className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-1.5 hover:bg-black transition-colors z-20">✕</button>
            </div>

            {/* Avatar & Identitas */}
            <div className="-mt-12 relative z-10 flex flex-col items-center px-6 w-full">
              <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden mb-2 border-2 border-white/20 shadow-xl flex items-center justify-center">
                {renderAvatar("w-20 h-20 text-xl font-bold", viewingProfileCard.profile_pic, viewingProfileCard.username)}
              </div>
              
              <h3 className="text-lg font-bold text-white mb-0.5">@{viewingProfileCard.username}</h3>
              <p className="text-[11px] font-mono text-gray-400 mb-2">ID: {viewingProfileCard.numeric_id || viewingProfileCard.id}</p>

              {/* Bio User */}
              <p className="text-xs text-gray-300 text-center italic bg-white/5 px-3 py-2 rounded-xl border border-white/5 w-full mb-4">
                &ldquo;{viewingProfileCard.bio || 'Music lover & Vibe enthusiast.'}&rdquo;
              </p>

              {/* Stats Card User Lain (Playlists, Followers, Following) - Tanpa Email! */}
              <div className="grid grid-cols-3 gap-2 w-full bg-white/5 border border-white/10 rounded-2xl p-3 mb-5 text-center">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">{viewingUserPlaylistsCount}</span>
                  <span className="text-[9px] text-gray-400 uppercase tracking-wide">Playlists</span>
                </div>
                <div className="flex flex-col border-l border-white/10">
                  <span className="text-sm font-bold text-white">{viewingUserFollowers}</span>
                  <span className="text-[9px] text-gray-400 uppercase tracking-wide">Followers</span>
                </div>
                <div className="flex flex-col border-l border-white/10">
                  <span className="text-sm font-bold text-white">{viewingUserFollowing}</span>
                  <span className="text-[9px] text-gray-400 uppercase tracking-wide">Following</span>
                </div>
              </div>

              {/* Tombol Follow / Unfollow */}
              <button 
                onClick={toggleFollowUser}
                className={`w-full py-3 rounded-full font-bold text-xs transition-colors shadow-lg ${isFollowingSelectedUser ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-white text-black hover:bg-gray-200'}`}
              >
                {isFollowingSelectedUser ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: FOLLOWERS LIST (Database Supabase) --- */}
      {isFollowersModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsFollowersModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-[#1c1c1c] border border-white/10 w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-lg font-bold">Daftar Followers ({followersCount})</h3>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {followersList.length > 0 ? (
                followersList.map((usr: any) => (
                  <div key={usr.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center font-bold text-xs">
                      {usr.profile_pic ? <img src={usr.profile_pic} className="w-full h-full object-cover" /> : usr.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">@{usr.username}</h4>
                      <p className="text-[10px] font-mono text-gray-400">ID: {usr.numeric_id || usr.id}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">Belum ada followers.</p>
              )}
            </div>
            <button onClick={() => setIsFollowersModalOpen(false)} className="w-full py-2.5 bg-[#2a2a2a] rounded-xl text-xs font-semibold">Tutup</button>
          </div>
        </div>
      )}

      {/* --- MODAL: FOLLOWING LIST (Database Supabase) --- */}
      {isFollowingModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsFollowingModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-[#1c1c1c] border border-white/10 w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-lg font-bold">Daftar Following ({followingCount})</h3>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {followingList.length > 0 ? (
                followingList.map((usr: any) => (
                  <div key={usr.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center font-bold text-xs">
                      {usr.profile_pic ? <img src={usr.profile_pic} className="w-full h-full object-cover" /> : usr.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">@{usr.username}</h4>
                      <p className="text-[10px] font-mono text-gray-400">ID: {usr.numeric_id || usr.id}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">Anda belum mengikuti siapapun.</p>
              )}
            </div>
            <button onClick={() => setIsFollowingModalOpen(false)} className="w-full py-2.5 bg-[#2a2a2a] rounded-xl text-xs font-semibold">Tutup</button>
          </div>
        </div>
      )}

      {isFullScreenSearch && (
        <div className="fixed inset-0 z-[110] bg-black text-white flex flex-col p-4 overflow-y-auto animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Trending & Viral Songs</h2>
            <button 
              onClick={() => setIsFullScreenSearch(false)}
              className="text-xs font-bold px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full"
            >
              Kembali
            </button>
          </div>

          <div className="flex flex-col gap-2 pb-20">
            {trendSongs.map((song: any, idx: number) => (
              <div 
                key={idx} 
                onClick={() => { playSong(song, trendSongs, idx); setIsFullScreenSearch(false); }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    {song.thumbnails?.[0]?.url && <img src={song.thumbnails[0].url} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold text-white truncate">{song.title}</span>
                    <span className="text-xs text-gray-400 truncate">{song.artists?.map((a: any) => a.name).join(', ')}</span>
                  </div>
                </div>
                {renderSongMenuButton(song)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Floating Mini Player */}
      {currentTrack && !isPlayerOpen && (
        <div 
          onClick={() => setIsPlayerOpen(true)}
          className="fixed bottom-[72px] left-2 right-2 bg-[#2a2a2a] rounded-md p-2 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.8)] z-50 cursor-pointer hover:bg-[#333333] transition-colors"
        >
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            <div className="w-10 h-10 bg-black rounded overflow-hidden flex-shrink-0">
               {currentTrack.thumbnails?.[0]?.url && <img src={currentTrack.thumbnails[0].url} alt="cover" className="w-full h-full object-cover" />}
            </div>
            <div className="flex flex-col overflow-hidden">
               <span className="text-sm font-semibold text-white truncate">{currentTrack.title}</span>
               <span className="text-xs text-gray-300 truncate">{currentTrack.artists?.map((a: any) => a.name).join(', ')}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-2 text-white">
            <button onClick={(e) => toggleLikeSong(currentTrack, e)} className="p-1">
              {isSongLiked(currentTrack.videoId) ? (
                <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              )}
            </button>
            <div onClick={togglePlay} className="p-2 cursor-pointer">
              {isBuffering ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </div>
          </div>
          
          <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-gray-600 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-300 ease-linear" style={{ width: `${playedProgress * 100}%` }}></div>
          </div>
        </div>
      )}

      {/* Full Player View */}
      <div 
        className={`fixed inset-0 z-[60] bg-gradient-to-b from-[#2a2a2a] to-black text-white flex flex-col transition-transform duration-300 ease-in-out overflow-y-auto pb-8 ${
          isPlayerOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {currentTrack && (
          <>
            <div className="flex items-center justify-between px-6 py-6 sticky top-0 bg-[#2a2a2a]/90 backdrop-blur-md z-10">
              <button onClick={() => setIsPlayerOpen(false)} className="p-2 -ml-2">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
              </button>
              <div className="text-center flex flex-col">
                 <span className="text-[10px] uppercase tracking-widest text-gray-300">Playing from Icarus</span>
                 <span className="text-xs font-bold">Start listening</span>
              </div>
              <button onClick={() => { setSelectedSongForMenu(currentTrack); setIsMenuOpen(true); }} className="p-2 -mr-2 text-white hover:text-gray-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
              </button>
            </div>

            <div className="px-8 mt-2 flex flex-col items-center">
              <div className="w-full aspect-square bg-gray-900 shadow-2xl mb-10 overflow-hidden rounded-md">
                {currentTrack.thumbnails?.[0]?.url && (
                  <img src={getHighResCover(currentTrack.thumbnails[currentTrack.thumbnails.length - 1].url)} alt="cover" className="w-full h-full object-cover" />
                )}
              </div>

              <div className="w-full flex justify-between items-center mb-8">
                <div className="overflow-hidden mr-4">
                  <h2 className="text-2xl font-bold truncate text-white mb-1">{currentTrack.title}</h2>
                  <p className="text-gray-400 text-lg truncate">{currentTrack.artists?.map((a: any) => a.name).join(', ')}</p>
                </div>
                <button onClick={(e) => toggleLikeSong(currentTrack, e)}>
                  {isSongLiked(currentTrack.videoId) ? (
                    <svg className="w-7 h-7 text-white fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  ) : (
                    <svg className="w-7 h-7 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                  )}
                </button>
              </div>

              <div className="w-full mb-6">
                <div onClick={handleSeek} className="py-2 cursor-pointer group">
                  <div className="h-[6px] bg-gray-600 rounded-full w-full relative">
                    <div className="h-full bg-white rounded-full absolute top-0 left-0 pointer-events-none" style={{ width: `${playedProgress * 100}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-gray-400 mt-1">
                  <span>{formatTime(playedSeconds)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="w-full flex items-center justify-between mb-10 px-2">
                <button onClick={() => setIsShuffle(!isShuffle)} className={`transition-colors ${isShuffle ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`}>
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                </button>
                <button onClick={handlePrev} className="text-white hover:text-gray-300">
                   <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                </button>
                <button onClick={togglePlay} className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                  {isBuffering ? (
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : isPlaying ? (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  ) : (
                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </button>
                <button onClick={handleNext} className="text-white hover:text-gray-300">
                   <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                </button>
                <button onClick={() => setIsRepeat(isRepeat === 'off' ? 'all' : isRepeat === 'all' ? 'one' : 'off')} className={`transition-colors ${isRepeat !== 'off' ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`}>
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                </button>
              </div>
            </div>

            <div className="px-6 mt-4 pb-12">
              <div className={`bg-[#181818] rounded-xl p-6 shadow-2xl transition-all duration-300 ${isLyricsExpanded ? 'fixed inset-4 z-50 bg-[#121212] flex flex-col' : 'min-h-[320px] max-h-[380px] overflow-hidden relative'}`}>
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-inherit pt-1 pb-3 border-b border-white/10 z-10">
                  <h3 className="text-sm font-bold tracking-wide">Lyrics</h3>
                  <button onClick={() => setIsLyricsExpanded(!isLyricsExpanded)} className="bg-black/60 p-2 rounded-full hover:bg-black transition-colors">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                  </button>
                </div>
                <div ref={lyricContainerRef} className={`relative overflow-y-auto scrollbar-none ${isLyricsExpanded ? 'flex-1 py-4 text-2xl md:text-3xl' : 'max-h-[260px] pr-2'}`}>
                  <div className="py-[120px] flex flex-col gap-4 text-xl font-bold">
                    {isLoadingLyrics ? (
                      <div className="text-gray-500 animate-pulse">Memuat lirik...</div>
                    ) : lyricLines.length > 0 ? (
                      lyricLines.map((line, idx) => {
                        const isActive = idx === activeLineIndex;
                        return (
                          <div key={idx} ref={isActive ? activeLyricRef : null} className={`transition-all duration-300 ${isActive ? 'text-white text-2xl md:text-3xl font-extrabold' : 'text-gray-500 text-lg opacity-60'}`}>
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
          </>
        )}
      </div>

      {/* --- MODAL TITIK TIGA (Untuk Semua Lagu) --- */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-sm flex items-end justify-center animate-fade-in" onClick={() => setIsMenuOpen(false)}>
          <div className="bg-[#242424] w-full max-w-md rounded-t-2xl p-6 flex flex-col gap-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-2"></div>
            
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-12 h-12 bg-black rounded overflow-hidden flex-shrink-0">
                {(selectedSongForMenu || currentTrack)?.thumbnails?.[0]?.url && (
                  <img src={(selectedSongForMenu || currentTrack).thumbnails[0].url} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-white text-base truncate">{(selectedSongForMenu || currentTrack)?.title}</span>
                <span className="text-xs text-gray-400 truncate">{(selectedSongForMenu || currentTrack)?.artists?.map((a:any)=>a.name).join(', ')}</span>
              </div>
            </div>

            <button onClick={() => { setSongToAddToPlaylist(selectedSongForMenu || currentTrack); setIsAddToPlaylistOpen(true); setIsMenuOpen(false); }} className="flex items-center gap-4 py-3 text-white font-medium hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span>Tambahkan ke Playlist...</span>
            </button>

            <button onClick={() => { toggleLikeSong(selectedSongForMenu || currentTrack); setIsMenuOpen(false); }} className="flex items-center gap-4 py-3 text-white font-medium hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              <span>{isSongLiked((selectedSongForMenu || currentTrack)?.videoId) ? 'Hapus dari Liked Songs' : 'Sukai Lagu Ini (Like)'}</span>
            </button>

            <button onClick={() => {
              if (navigator.share) {
                navigator.share({ title: (selectedSongForMenu || currentTrack)?.title, url: window.location.href });
              } else {
                setToastMessage("Tautan lagu tersalin ke clipboard!");
              }
              setIsMenuOpen(false);
            }} className="flex items-center gap-4 py-3 text-white font-medium hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
              <span>Bagikan (Share)</span>
            </button>

            <button onClick={() => setIsMenuOpen(false)} className="mt-2 w-full py-3 bg-[#333] rounded-full font-semibold text-center text-white">Tutup</button>
          </div>
        </div>
      )}

      {isAddToPlaylistOpen && (
        <div className="fixed inset-0 z-[140] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsAddToPlaylistOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-[#1c1c1c] border border-white/10 w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-lg font-bold">Tambah ke Playlist</h3>
            
            <button 
              onClick={() => setIsCreatePlaylistOpen(true)}
              className="w-full py-3 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <span>+ Create a Playlist</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-[10px] uppercase">Atau pilih playlist</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {playlists.length > 0 ? (
                playlists.map((pl) => (
                  <div key={pl.id} onClick={() => addSongToPlaylist(pl.id)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer flex justify-between items-center text-sm font-medium">
                    <span>{pl.name} {pl.isCollaborative && '🤝'}</span>
                    <span className="text-xs text-gray-400">{pl.songs.length} lagu</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">Belum ada playlist.</p>
              )}
            </div>
            <button onClick={() => setIsAddToPlaylistOpen(false)} className="w-full py-2.5 bg-[#2a2a2a] text-gray-300 font-semibold rounded-xl text-xs mt-1">Tutup</button>
          </div>
        </div>
      )}

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

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full h-[64px] bg-gradient-to-t from-black via-black/95 to-black/80 px-6 flex items-center justify-between z-40 pb-2">
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
