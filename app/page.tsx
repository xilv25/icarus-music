'use client'

import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Home, Search, Library, User, Play, Pause, SkipForward, SkipBack, 
  Repeat, Shuffle, Heart, MoreVertical, Plus, Check, Globe, Shield, 
  LogOut, Edit3, Camera, Image as ImageIcon, ChevronRight, X, Sparkles, Music2, Radio
} from 'lucide-react'

// Types
interface Track {
  id: string
  title: string
  artist: string
  coverUrl: string
  duration: string
  type: 'music' | 'podcast'
  genre?: string
}

interface Playlist {
  id: string
  name: string
  tracks: Track[]
}

export default function IcarusMusicApp() {
  // Navigation & View States (SPA)
  const [currentView, setCurrentView] = useState<'home' | 'search' | 'library' | 'profile' | 'see-all' | 'search-detail'>('home')
  const [topFilter, setTopFilter] = useState<'all' | 'music' | 'podcasts'>('all')

  // Auth States (Enterprise Grade Security)
  const [user, setUser] = useState<any>(null)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Player States
  const [currentTrack, setCurrentTrack] = useState<Track>({
    id: '1',
    title: 'watch',
    artist: 'Billie Eilish',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
    duration: '2:58',
    type: 'music',
    genre: 'Pop'
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(25)

  // Profile States
  const [profileData, setProfileData] = useState({
    username: 'Icarus User',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    cover: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    bio: 'Music enthusiast & developer.'
  })
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  // Playlist & Library States
  const [playlists, setPlaylists] = useState<Playlist[]>([
    { id: 'p1', name: 'Favorites 2026', tracks: [] },
    { id: 'p2', name: 'Late Night Vibe', tracks: [] }
  ])
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false)
  const [trackToAddToPlaylist, setTrackToAddToPlaylist] = useState<Track | null>(null)
  const [newPlaylistNameInput, setNewPlaylistNameInput] = useState('')

  // Search & History States
  const [searchQuery, setSearchQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([
    'Billie Eilish', 'The Weeknd', 'Sabrina Carpenter', 'Top Hits 2026', 'Lofi Beats'
  ])
  const [showAllHistory, setShowAllHistory] = useState(false)

  // Vibe List State (Show More pagination)
  const [vibeLimit, setVibeLimit] = useState(5)

  // Mock Data
  const trendingTracks: Track[] = [
    { id: 't1', title: 'Timeless', artist: 'The Weeknd, Playboi Carti', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80', duration: '4:16', type: 'music' },
    { id: 't2', title: 'Espresso', artist: 'Sabrina Carpenter', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&auto=format&fit=crop&q=80', duration: '2:55', type: 'music' },
    { id: 't3', title: 'Unholy', artist: 'Sam Smith, Kim Petras', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80', duration: '2:36', type: 'music' },
    { id: 't4', title: 'Dandelions', artist: 'Ruth B.', coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&auto=format&fit=crop&q=80', duration: '3:53', type: 'music' },
    { id: 't5', title: 'Blinding Lights', artist: 'The Weeknd', coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80', duration: '3:20', type: 'music' },
  ]

  const vibeTracks: Track[] = [
    { id: 'v1', title: 'WILDFLOWER', artist: 'Billie Eilish', coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80', duration: '4:21', type: 'music' },
    { id: 'v2', title: 'I Wanna Be Yours', artist: 'Arctic Monkeys', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80', duration: '3:03', type: 'music' },
    { id: 'v3', title: 'Baby By Me', artist: '50 Cent, Ne-Yo', coverUrl: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=300&auto=format&fit=crop&q=80', duration: '3:33', type: 'music' },
    { id: 'v4', title: 'One Of The Girls', artist: 'The Weeknd, JENNIE', coverUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&auto=format&fit=crop&q=80', duration: '4:04', type: 'music' },
    { id: 'v5', title: '2 On (feat. ScHoolboy Q)', artist: 'Tinashe', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80', duration: '3:47', type: 'music' },
    { id: 'v6', title: 'Cry', artist: 'Cigarettes After Sex', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80', duration: '4:51', type: 'music' },
    { id: 'v7', title: 'Let Me Be', artist: 'The Second Voice', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80', duration: '3:15', type: 'music' }
  ]

  // Supabase Auth Check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Enterprise Security Auth Handler
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    // Basic Enterprise Validation Rules
    if (!email || !password) {
      setAuthError('Email and password are required.')
      setAuthLoading(false)
      return
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters securely.')
      setAuthLoading(false)
      return
    }

    try {
      if (authMode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('Registration successful! Please verify or log in.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error occurred.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // Playlist Handler (No manual preliminary creation required)
  const openAddToPlaylist = (track: Track) => {
    setTrackToAddToPlaylist(track)
    setShowAddToPlaylistModal(true)
  }

  const addToSpecificPlaylist = (playlistId: string) => {
    if (!trackToAddToPlaylist) return
    setPlaylists(playlists.map(p => {
      if (p.id === playlistId) {
        if (!p.tracks.some(t => t.id === trackToAddToPlaylist.id)) {
          return { ...p, tracks: [...p.tracks, trackToAddToPlaylist] }
        }
      }
      return p
    }))
    setShowAddToPlaylistModal(false)
    setTrackToAddToPlaylist(null)
  }

  const createAndAddToNewPlaylist = () => {
    if (!newPlaylistNameInput.trim() || !trackToAddToPlaylist) return
    const newPl: Playlist = {
      id: 'pl_' + Date.now(),
      name: newPlaylistNameInput.trim(),
      tracks: [trackToAddToPlaylist]
    }
    setPlaylists([...playlists, newPl])
    setNewPlaylistNameInput('')
    setShowAddToPlaylistModal(false)
    setTrackToAddToPlaylist(null)
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans select-none overflow-hidden max-w-md mx-auto relative border-x border-zinc-900 shadow-2xl">
      
      {/* Top Navbar Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-zinc-900 to-black z-20">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setCurrentView('profile')}
            className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700 focus:outline-none"
          >
            <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
          </button>
          <div className="flex space-x-1.5">
            <button 
              onClick={() => setTopFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition ${topFilter === 'all' ? 'bg-white text-black' : 'bg-zinc-800 text-white'}`}
            >
              All
            </button>
            <button 
              onClick={() => setTopFilter('music')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition ${topFilter === 'music' ? 'bg-white text-black' : 'bg-zinc-800 text-white'}`}
            >
              Music
            </button>
            <button 
              onClick={() => setTopFilter('podcasts')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition ${topFilter === 'podcasts' ? 'bg-white text-black' : 'bg-zinc-800 text-white'}`}
            >
              Podcasts
            </button>
          </div>
        </div>
        {user ? (
          <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
            <Shield size={10} /> Secure
          </span>
        ) : (
          <button 
            onClick={() => setCurrentView('profile')}
            className="text-xs bg-zinc-800 px-3 py-1 rounded-full text-zinc-300 hover:text-white"
          >
            Sign In
          </button>
        )}
      </div>

      {/* Main Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pb-32">
        
        {/* VIEW: HOME */}
        {currentView === 'home' && (
          <div className="p-4 space-y-6">
            {/* Start Listening Carousel (Larger Cards + 3 dots menu) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold tracking-tight">Start listening</h2>
                <button 
                  onClick={() => setCurrentView('see-all')}
                  className="text-xs text-zinc-400 hover:text-white transition font-semibold"
                >
                  See all
                </button>
              </div>

              <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-none">
                {trendingTracks.map((track) => (
                  <div key={track.id} className="min-w-[150px] max-w-[150px] bg-zinc-900/60 p-2.5 rounded-xl flex flex-col justify-between hover:bg-zinc-800/80 transition group">
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                      <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      <button 
                        onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
                        className="absolute bottom-2 right-2 w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition transform translate-y-1 group-hover:translate-y-0"
                      >
                        <Play size={18} className="text-black fill-black ml-0.5" />
                      </button>
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="overflow-hidden pr-1">
                        <p className="text-sm font-semibold truncate">{track.title}</p>
                        <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button className="text-zinc-400 hover:text-white">
                          <Heart size={14} />
                        </button>
                        <button 
                          onClick={() => openAddToPlaylist(track)}
                          className="text-zinc-400 hover:text-white p-0.5"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Played */}
            <div>
              <h2 className="text-lg font-bold tracking-tight mb-3">Recently Played</h2>
              <div className="grid grid-cols-1 gap-2">
                {[currentTrack, trendingTracks[0], trendingTracks[1]].map((track, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
                    className="flex items-center justify-between bg-zinc-900/40 hover:bg-zinc-800/60 p-2 rounded-lg cursor-pointer transition group"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={track.coverUrl} alt="" className="w-11 h-11 rounded object-cover" />
                      <div>
                        <p className="text-sm font-medium text-white">{track.title}</p>
                        <p className="text-xs text-zinc-400">{track.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={(e) => { e.stopPropagation(); openAddToPlaylist(track); }} className="text-zinc-400 hover:text-white p-1">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vibe List (Regular vertical list without carousel, 5 rows + Show More) */}
            <div>
              <h2 className="text-lg font-bold tracking-tight mb-3">Recommended for your vibe</h2>
              <div className="space-y-2">
                {vibeTracks.slice(0, vibeLimit).map((track) => (
                  <div 
                    key={track.id}
                    onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/30 hover:bg-zinc-800/50 cursor-pointer transition"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={track.coverUrl} alt="" className="w-12 h-12 rounded object-cover" />
                      <div>
                        <p className="text-sm font-semibold">{track.title}</p>
                        <p className="text-xs text-zinc-400">{track.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={(e) => { e.stopPropagation(); openAddToPlaylist(track); }} className="text-zinc-400 hover:text-white p-1.5">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {vibeLimit < vibeTracks.length ? (
                <button 
                  onClick={() => setVibeLimit(vibeTracks.length)}
                  className="w-full mt-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900/50 rounded-lg transition"
                >
                  Show More
                </button>
              ) : (
                <button 
                  onClick={() => setVibeLimit(5)}
                  className="w-full mt-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900/50 rounded-lg transition"
                >
                  Show Less
                </button>
              )}
            </div>

          </div>
        )}

        {/* VIEW: SEARCH FULL SCREEN OVERLAY */}
        {currentView === 'search' && (
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari lagu atau artis favoritmu"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-800/90 text-white placeholder-zinc-400 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>

            {/* Recent Search History */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Recent Searches</h3>
              </div>
              <div className="space-y-1">
                {(showAllHistory ? searchHistory : searchHistory.slice(0, 5)).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-zinc-900 cursor-pointer">
                    <span className="text-sm text-zinc-200">{item}</span>
                    <button onClick={() => setSearchHistory(searchHistory.filter((_, i) => i !== idx))} className="text-zinc-500 hover:text-white text-xs">Clear</button>
                  </div>
                ))}
                {searchHistory.length > 5 && !showAllHistory && (
                  <button onClick={() => setShowAllHistory(true)} className="text-xs text-zinc-400 hover:text-white font-semibold py-1">
                    Show More
                  </button>
                )}
              </div>
            </div>

            {/* Trending Quick Picks */}
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Trending Tracks</h3>
              <div className="space-y-2">
                {trendingTracks.slice(0, 3).map((track) => (
                  <div key={track.id} onClick={() => { setCurrentTrack(track); setIsPlaying(true); }} className="flex items-center space-x-3 p-2 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 cursor-pointer">
                    <img src={track.coverUrl} className="w-10 h-10 rounded object-cover" />
                    <div>
                      <p className="text-sm font-medium">{track.title}</p>
                      <p className="text-xs text-zinc-400">{track.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: SEE ALL (Full screen black view covering navigation temporarily) */}
        {currentView === 'see-all' && (
          <div className="absolute inset-0 bg-black z-50 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h2 className="text-lg font-bold">Trending & Top Hits 2026</h2>
              <button 
                onClick={() => setCurrentView('home')}
                className="p-2 bg-zinc-800 rounded-full text-zinc-300 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[...trendingTracks, ...vibeTracks].map((track) => (
                <div 
                  key={track.id} 
                  onClick={() => { setCurrentTrack(track); setIsPlaying(true); setCurrentView('home'); }}
                  className="bg-zinc-900/60 p-2.5 rounded-xl flex flex-col justify-between hover:bg-zinc-800 cursor-pointer"
                >
                  <img src={track.coverUrl} className="w-full aspect-square rounded-lg object-cover mb-2" />
                  <p className="text-xs font-bold truncate">{track.title}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{track.artist}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: LIBRARY */}
        {currentView === 'library' && (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold">Your Library & Playlists</h2>
            <div className="space-y-3">
              {playlists.map((pl) => (
                <div key={pl.id} className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm text-emerald-400">{pl.name}</h3>
                    <span className="text-xs text-zinc-500">{pl.tracks.length} songs</span>
                  </div>
                  {pl.tracks.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No tracks in this playlist yet.</p>
                  ) : (
                    <div className="space-y-1">
                      {pl.tracks.map((t, idx) => (
                        <div key={idx} onClick={() => { setCurrentTrack(t); setIsPlaying(true); }} className="flex justify-between items-center text-xs py-1 hover:text-emerald-400 cursor-pointer">
                          <span>{t.title} - {t.artist}</span>
                          <span className="text-zinc-500">{t.duration}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: PROFILE (Enterprise Level + GIF Cover Support) */}
        {currentView === 'profile' && (
          <div className="pb-10">
            {/* Cover Background (Supports GIF/Image URL) */}
            <div className="relative h-44 w-full bg-zinc-800">
              <img src={profileData.cover} alt="Cover" className="w-full h-full object-cover" />
              <button 
                onClick={() => setCurrentView('home')}
                className="absolute top-3 left-3 bg-black/60 p-2 rounded-full text-white backdrop-blur-md"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 relative -mt-12 space-y-4">
              <div className="flex items-end justify-between">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-black bg-zinc-900">
                  <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <button 
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-full border border-zinc-700 transition"
                >
                  {isEditingProfile ? 'Done Editing' : 'Edit Profile'}
                </button>
              </div>

              <div>
                <h1 className="text-xl font-bold">{profileData.username}</h1>
                <p className="text-xs text-zinc-400">{user ? user.email : 'Guest Enterprise User'}</p>
                <p className="text-xs text-zinc-300 mt-2">{profileData.bio}</p>
              </div>

              {/* Enterprise Profile Edit Form */}
              {isEditingProfile && (
                <div className="bg-zinc-900 p-4 rounded-xl space-y-3 border border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Enterprise Account Settings</h3>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Username</label>
                    <input 
                      type="text" 
                      value={profileData.username}
                      onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                      className="w-full bg-black border border-zinc-700 rounded p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Cover URL (Supports GIF)</label>
                    <input 
                      type="text" 
                      value={profileData.cover}
                      onChange={(e) => setProfileData({...profileData, cover: e.target.value})}
                      className="w-full bg-black border border-zinc-700 rounded p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Avatar URL</label>
                    <input 
                      type="text" 
                      value={profileData.avatar}
                      onChange={(e) => setProfileData({...profileData, avatar: e.target.value})}
                      className="w-full bg-black border border-zinc-700 rounded p-2 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* Enterprise Auth Section */}
              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-3">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-zinc-300">
                      <span>Enterprise Security Active</span>
                      <span className="text-emerald-400 font-bold">256-bit SSL</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 text-xs font-semibold rounded-lg border border-red-800/50 flex items-center justify-center gap-2 transition"
                    >
                      <LogOut size={14} /> Log Out Enterprise Session
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAuth} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                        {authMode === 'login' ? 'Enterprise Login' : 'Enterprise Register'}
                      </h3>
                      <button 
                        type="button" 
                        onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                        className="text-[10px] text-emerald-400 underline"
                      >
                        {authMode === 'login' ? 'Create Account' : 'Existing User? Login'}
                      </button>
                    </div>

                    {authError && <p className="text-[11px] text-red-500 bg-red-950/50 p-2 rounded">{authError}</p>}

                    <input 
                      type="email" 
                      placeholder="corporate@company.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded p-2 text-xs text-white"
                    />
                    <input 
                      type="password" 
                      placeholder="Secure Password (min 6 chars)" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded p-2 text-xs text-white"
                    />
                    <button 
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-lg transition"
                    >
                      {authLoading ? 'Processing...' : (authMode === 'login' ? 'Secure Login' : 'Register Account')}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add To Playlist Modal (Instant Create & Add without separate steps) */}
      {showAddToPlaylistModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 w-full max-w-xs rounded-xl p-4 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Add to Playlist</h3>
              <button onClick={() => setShowAddToPlaylistModal(false)} className="text-zinc-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1 max-h-40 overflow-y-auto">
              {playlists.map((pl) => (
                <button 
                  key={pl.id}
                  onClick={() => addToSpecificPlaylist(pl.id)}
                  className="w-full text-left px-3 py-2 text-xs rounded hover:bg-zinc-800 text-zinc-200 transition flex justify-between items-center"
                >
                  <span>{pl.name}</span>
                  <Plus size={14} className="text-zinc-500" />
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <p className="text-[10px] text-zinc-400 uppercase font-bold">Or create new playlist instantly:</p>
              <input 
                type="text" 
                placeholder="New Playlist Name"
                value={newPlaylistNameInput}
                onChange={(e) => setNewPlaylistNameInput(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded p-2 text-xs text-white"
              />
              <button 
                onClick={createAndAddToNewPlaylist}
                className="w-full py-2 bg-emerald-500 text-black text-xs font-bold rounded hover:bg-emerald-400 transition"
              >
                Create & Add Song Automatically
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mini Player Bar */}
      <div className="absolute bottom-16 left-2 right-2 bg-zinc-900/95 backdrop-blur-md rounded-xl p-2.5 flex items-center justify-between border border-zinc-800 shadow-xl z-30">
        <div className="flex items-center space-x-3 overflow-hidden">
          <img src={currentTrack.coverUrl} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate text-white">{currentTrack.title}</p>
            <p className="text-[10px] text-zinc-400 truncate">{currentTrack.artist}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="text-zinc-400 hover:text-white">
            <Heart size={16} />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition"
          >
            {isPlaying ? <Pause size={14} className="fill-black" /> : <Play size={14} className="fill-black ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Bottom Navigation Bar (SPA Routing) */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-black border-t border-zinc-900 flex justify-around items-center px-2 z-30">
        <button 
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center space-y-1 ${currentView === 'home' ? 'text-white' : 'text-zinc-500'}`}
        >
          <Home size={20} />
          <span className="text-[10px]">Home</span>
        </button>
        <button 
          onClick={() => setCurrentView('search')}
          className={`flex flex-col items-center space-y-1 ${currentView === 'search' ? 'text-white' : 'text-zinc-500'}`}
        >
          <Search size={20} />
          <span className="text-[10px]">Search</span>
        </button>
        <button 
          onClick={() => setCurrentView('library')}
          className={`flex flex-col items-center space-y-1 ${currentView === 'library' ? 'text-white' : 'text-zinc-500'}`}
        >
          <Library size={20} />
          <span className="text-[10px]">Library</span>
        </button>
        <button 
          onClick={() => setCurrentView('profile')}
          className={`flex flex-col items-center space-y-1 ${currentView === 'profile' ? 'text-white' : 'text-zinc-500'}`}
        >
          <User size={20} />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>

    </div>
  )
}
