'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getPromptImageUrl } from '@/utils/placeholderImage';

// Define interface for user profile data
interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  bio?: string | null;
  createdAt: string;
  _count?: {
    prompts?: number;
    followedBy?: number;
    following?: number;
    savedPrompts?: number;
  };
}

interface Prompt {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('my-prompts');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [myPrompts, setMyPrompts] = useState<Prompt[]>([]);
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [followersUsers, setFollowersUsers] = useState<any[]>([]);
  const [followingUsers, setFollowingUsers] = useState<any[]>([]);
  
  // Check if user is authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status === 'authenticated' && session?.user) {
        try {
          setLoading(true);
          const response = await fetch('/api/users/profile');
          
          if (!response.ok) {
            throw new Error('Failed to fetch profile data');
          }
          
          const data = await response.json();
          setUserProfile(data.user);
          
          // Get followers and following count from API response
          const followersCount = data.user._count?.followedBy || 0;
          const followingCount = data.user._count?.following || 0;
          
          setFollowers(followersCount);
          setFollowing(followingCount);
          
          // This is always the current user's own profile in this page
          // No need to show follow button when viewing own profile
          setIsFollowing(false);
        } catch (err) {
          console.error('Error fetching profile:', err);
          setError('Failed to load profile data');
        } finally {
          setLoading(false);
        }
      }
    };
    
    if (status === 'authenticated') {
      fetchUserProfile();
    }
  }, [status, session]);

  // Check for locally stored avatar preview
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  
  // Get locally stored avatar if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedAvatar = localStorage.getItem('userAvatarPreview');
        if (storedAvatar) {
          setLocalAvatar(storedAvatar);
        }
      } catch (e) {
        console.warn('Could not access local storage for avatar preview', e);
      }
    }
  }, []);
  
  // Create a user object that combines fetched data with session data as fallback
  const user = {
    id: userProfile?.id || session?.user?.id || '',
    name: userProfile?.name || session?.user?.name || 'User',
    username: userProfile?.email?.split('@')[0] || session?.user?.email?.split('@')[0] || 'user',
    bio: userProfile?.bio || 'No bio yet',
    joinedYear: userProfile ? new Date(userProfile.createdAt).getFullYear().toString() : new Date().getFullYear().toString(),
    // Use locally stored avatar if available, otherwise fall back to database or session
    avatar: localAvatar || userProfile?.image || session?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.name || session?.user?.name || 'User')}&background=random`,
    promptCount: userProfile?._count?.prompts || 0,
    followers,
    following,
    isFollowing,
    isOwnProfile: true, // This is always the user's own profile in the profile page
    savedPromptCount: userProfile?._count?.savedPrompts || 0
  };

  // Fetch user prompts when tab changes or profile loads
  useEffect(() => {
    const fetchUserPrompts = async () => {
      if (!userProfile || !session) return;
      
      setLoadingPrompts(true);
      try {
        if (activeTab === 'my-prompts') {
          const response = await fetch(`/api/users/prompts`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch user prompts');
          }
          
          const data = await response.json();
          setMyPrompts(data.prompts || []);
        } 
        else if (activeTab === 'saved-prompts') {
          const response = await fetch(`/api/users/saved-prompts`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch saved prompts');
          }
          
          const data = await response.json();
          setSavedPrompts(data.prompts || []);
        }
        else if (activeTab === 'followers') {
          // Fetch followers and following lists
          const followersResponse = await fetch(`/api/users/followers`);
          const followingResponse = await fetch(`/api/users/following`);
          
          if (!followersResponse.ok || !followingResponse.ok) {
            throw new Error('Failed to fetch followers/following data');
          }
          
          const followersData = await followersResponse.json();
          const followingData = await followingResponse.json();
          
          setFollowersUsers(followersData.followers || []);
          setFollowingUsers(followingData.following || []);
        }
      } catch (err) {
        console.error(`Error fetching ${activeTab}:`, err);
      } finally {
        setLoadingPrompts(false);
      }
    };
    
    if (userProfile && !loading) {
      fetchUserPrompts();
    }
  }, [activeTab, userProfile, session, loading]);

  // Function to toggle follow state
  const toggleFollow = async () => {
    try {
      // Save current state to revert if needed
      const currentFollowState = isFollowing;
      const currentFollowerCount = followers;
      
      // Optimistically update UI
      setIsFollowing(!isFollowing);
      if (isFollowing) {
        setFollowers(prev => Math.max(0, prev - 1));
      } else {
        setFollowers(prev => prev + 1);
      }
      
      // Call the API to follow/unfollow the user
      const response = await fetch('/api/users/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userProfile?.id,
          action: currentFollowState ? 'unfollow' : 'follow' 
        })
      });
      
      if (!response.ok) {
        // If API call fails, revert the UI changes
        throw new Error('Failed to update follow status');
      }
      
      const data = await response.json();
      // Update with accurate count from server
      setFollowers(data.followerCount); 
      
      console.log(!currentFollowState ? 'Following user' : 'Unfollowed user');
    } catch (err) {
      console.error('Error toggling follow:', err);
      // Revert the state changes on error
      setIsFollowing(isFollowing);
      setFollowers(followers);
    }
  };

  return (
    <div className="flex flex-1 justify-center py-5 px-4 md:px-8 lg:px-16 xl:px-40">
      <div className="flex flex-col max-w-[960px] flex-1">
        {/* User Profile Header */}
        <div className="flex p-4 @container">
          <div className="flex w-full flex-col gap-4 items-center">
            <div className="flex gap-4 flex-col items-center relative">
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32"
                style={{ backgroundImage: `url("${user.avatar}")` }}
              />
              <div className="flex flex-col items-center justify-center justify-center">
                <p className="text-text text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">{user.name}</p>
                <p className="text-text-muted text-base font-normal leading-normal text-center">{user.bio}</p>
                <p className="text-text-muted text-base font-normal leading-normal text-center">Joined in {user.joinedYear}</p>
              </div>
              
              {/* Edit Profile Button (Gear Icon) */}
              <Link href="/profile/edit" className="absolute top-0 right-0 p-2 rounded-full bg-background border border-border hover:bg-background/80">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </Link>
            </div>
            {/* Don't show follow button on own profile */}
          </div>
        </div>

        {/* Profile Navigation Tabs */}
        <div className="pb-3">
          <div className="flex border-b border-border px-4 gap-8">
            <button 
              className={`flex flex-col items-center justify-center border-b-[3px] ${activeTab === 'my-prompts' ? 'border-b-primary text-text' : 'border-b-transparent text-text-muted'} pb-[13px] pt-4`}
              onClick={() => setActiveTab('my-prompts')}
            >
              <p className={`text-sm font-bold leading-normal tracking-[0.015em]`}>My Prompts</p>
            </button>
            <button 
              className={`flex flex-col items-center justify-center border-b-[3px] ${activeTab === 'saved-prompts' ? 'border-b-primary text-text' : 'border-b-transparent text-text-muted'} pb-[13px] pt-4`}
              onClick={() => setActiveTab('saved-prompts')}
            >
              <p className={`text-sm font-bold leading-normal tracking-[0.015em]`}>Saved Prompts</p>
            </button>
            <button 
              className={`flex flex-col items-center justify-center border-b-[3px] ${activeTab === 'followers' ? 'border-b-primary text-text' : 'border-b-transparent text-text-muted'} pb-[13px] pt-4`}
              onClick={() => setActiveTab('followers')}
            >
              <p className={`text-sm font-bold leading-normal tracking-[0.015em]`}>Followers/Following</p>
            </button>
          </div>
        </div>

        {/* Content Based on Active Tab */}
        {activeTab === 'my-prompts' && (
          <>
            <div className="flex justify-between items-center px-4 pb-2 pt-4">
              <h3 className="text-text text-lg font-bold leading-tight tracking-[-0.015em]">My Prompts</h3>
              <Link href="/create">
                <button className="px-3 py-1.5 bg-[#bada55] text-background text-sm rounded-xl hover:bg-[#333333] flex items-center gap-1 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Create Prompt
                </button>
              </Link>
            </div>
            
            {loadingPrompts ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : myPrompts.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-text-muted">You haven&apos;t created any prompts yet.</p>
                <Link href="/create">
                  <button className="mt-4 px-4 py-2 bg-[#bada55] text-background rounded-xl hover:bg-[#333333] transition-colors">
                    Create Your First Prompt
                  </button>
                </Link>
              </div>
            ) : (
              myPrompts.map(prompt => (
                <div key={prompt.id} className="p-4">
                  <div className="flex items-stretch justify-between gap-4 rounded-xl border border-border hover:border-[#bada55] transition-all p-4 hover:shadow-md group">
                    <div className="flex flex-[2_2_0px] flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-text text-base font-bold leading-tight group-hover:text-[#bada55] transition-colors">{prompt.title}</p>
                        <p className="text-text-muted text-sm font-normal leading-normal">
                          {prompt.description}
                        </p>
                      </div>
                      <Link href={`/prompt/${prompt.id}`}>
                        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 flex-row-reverse bg-background border border-border hover:bg-[#bada55] hover:text-background text-text text-sm font-medium leading-normal w-fit transition-colors">
                          <span className="truncate">Open Prompt</span>
                        </button>
                      </Link>
                    </div>
                    <div 
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                      style={{ backgroundImage: `url("${getPromptImageUrl({
                        title: prompt.title,
                        image: prompt.image,
                        userName: user.name,
                        tags: []
                      })}")` }}
                    />
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'saved-prompts' && (
          <>
            <h3 className="text-text text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Saved Prompts</h3>
            
            {loadingPrompts ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : savedPrompts.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-text-muted">You haven&apos;t saved any prompts yet.</p>
                <Link href="/explore">
                  <button className="mt-4 px-4 py-2 bg-[#bada55] text-background rounded-xl hover:bg-[#333333] transition-colors">
                    Explore Prompts
                  </button>
                </Link>
              </div>
            ) : (
              savedPrompts.map(prompt => (
                <div key={prompt.id} className="p-4">
                  <div className="flex items-stretch justify-between gap-4 rounded-xl border border-border hover:border-[#bada55] transition-all p-4 hover:shadow-md group">
                    <div className="flex flex-[2_2_0px] flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-text text-base font-bold leading-tight group-hover:text-[#bada55] transition-colors">{prompt.title}</p>
                        <p className="text-text-muted text-sm font-normal leading-normal">
                          {prompt.description}
                        </p>
                      </div>
                      <Link href={`/prompt/${prompt.id}`}>
                        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 flex-row-reverse bg-background border border-border hover:bg-[#bada55] hover:text-background text-text text-sm font-medium leading-normal w-fit transition-colors">
                          <span className="truncate">Open Prompt</span>
                        </button>
                      </Link>
                    </div>
                    <div 
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                      style={{ backgroundImage: `url("${getPromptImageUrl({
                        title: prompt.title,
                        image: prompt.image,
                        userName: user.name,
                        tags: []
                      })}")` }}
                    />
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'followers' && (
          <div className="p-4">
            {loadingPrompts ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Followers Section */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-text text-lg font-bold leading-tight tracking-[-0.015em]">Followers</h3>
                  
                  {followersUsers.length === 0 ? (
                    <p className="text-text-muted text-sm">No followers yet</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {followersUsers.map(follower => (
                        <div key={follower.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full bg-cover bg-center"
                              style={{ backgroundImage: follower.image ? `url("${follower.image}")` : 'none', backgroundColor: !follower.image ? '#e5e7eb' : undefined }}
                            />
                            <span className="text-text">{follower.name}</span>
                          </div>
                          <button className="px-3 py-1 text-xs rounded-xl bg-background border border-border hover:bg-background/80">
                            Profile
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Following Section */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-text text-lg font-bold leading-tight tracking-[-0.015em]">Following</h3>
                  
                  {followingUsers.length === 0 ? (
                    <p className="text-text-muted text-sm">Not following anyone</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {followingUsers.map(following => (
                        <div key={following.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full bg-cover bg-center"
                              style={{ backgroundImage: following.image ? `url("${following.image}")` : 'none', backgroundColor: !following.image ? '#e5e7eb' : undefined }}
                            />
                            <span className="text-text">{following.name}</span>
                          </div>
                          <button className="px-3 py-1 text-xs rounded-xl bg-primary text-white hover:bg-primary/90">
                            Unfollow
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
