'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

// Define interface for user profile data
interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  _count: {
    prompts: number;
    followedBy: number;
    following: number;
  };
  isFollowing?: boolean;
}

// Define interface for prompts
interface Prompt {
  id: string;
  title: string;
  description: string;
  promptText: string;
  suggestedModel: string;
  image?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  categories: string[];
  _count: {
    ratings: number;
  };
  averageRating: number;
  isSaved?: boolean;
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  // Store params.id in a local variable to prevent future issues with direct access
  const userId = params.id as string;

  // State variables
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('prompts');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  
  // Safety check - switch to prompts tab if viewing other user's saved tab
  useEffect(() => {
    if (session && session.user && session.user.id !== userId && activeTab === 'saved') {
      setActiveTab('prompts');
    }
  }, [session, userId, activeTab]);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        const data = await response.json();
        setUserProfile(data);
        setIsFollowing(data.isFollowing || false);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  // Fetch user's prompts
  useEffect(() => {
    const fetchUserPrompts = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch(`/api/users/${userId}/prompts`);
        if (!response.ok) {
          throw new Error('Failed to fetch user prompts');
        }
        const data = await response.json();
        setPrompts(data);
      } catch (err: any) {
        console.error('Error fetching prompts:', err);
      }
    };

    if (activeTab === 'prompts') {
      fetchUserPrompts();
    }
  }, [userId, activeTab]);

  // Fetch user's saved prompts - only for current user
  useEffect(() => {
    const fetchSavedPrompts = async () => {
      if (!userId || !session?.user?.id || session.user.id !== userId) return;
      
      try {
        const response = await fetch(`/api/users/${userId}/saved`);
        if (!response.ok) {
          throw new Error('Failed to fetch saved prompts');
        }
        const data = await response.json();
        setSavedPrompts(data);
      } catch (err: any) {
        console.error('Error fetching saved prompts:', err);
      }
    };

    if (activeTab === 'saved') {
      fetchSavedPrompts();
    }
  }, [userId, activeTab, session]);

  // Handle follow/unfollow user
  const handleFollowToggle = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    setIsFollowingLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isFollowing ? 'unfollow' : 'follow',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
      }

      // Update following state and followers count optimistically
      setIsFollowing(!isFollowing);
      setUserProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          _count: {
            ...prev._count,
            followedBy: isFollowing 
              ? prev._count.followedBy - 1 
              : prev._count.followedBy + 1
          }
        };
      });
    } catch (err: any) {
      console.error('Error toggling follow:', err);
    } finally {
      setIsFollowingLoading(false);
    }
  };

  // Helper function to render star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={i} className="w-5 h-5 fill-yellow-400" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg key={i} className="w-5 h-5 fill-yellow-400" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fillOpacity="0.5" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        );
      }
    }
    
    return stars;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error || 'User profile not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Profile Header */}
      <div className="bg-secondary rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden">
            <Image 
              src={userProfile.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=random`} 
              alt={`${userProfile.name}'s profile`} 
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              style={{ objectFit: "cover" }}
              unoptimized
            />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h1 className="text-2xl font-bold">{userProfile.name}</h1>
              
              {/* Follow button - only show if viewing someone else's profile */}
              {session && session.user && session.user.id !== userId && (
                <button 
                  onClick={handleFollowToggle}
                  disabled={isFollowingLoading}
                  className={`px-4 py-2 rounded-md font-medium border ${
                    isFollowing 
                      ? 'bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300' 
                      : 'bg-primary text-white border-primary hover:bg-primary-dark'
                  } transition-colors`}
                >
                  {isFollowingLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
            
            {userProfile.bio && (
              <p className="text-text mt-2 max-w-2xl">{userProfile.bio}</p>
            )}
            
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="text-text-muted">
                <span className="font-semibold text-text">{userProfile._count.prompts}</span> prompts
              </div>
              <div className="text-text-muted">
                <span className="font-semibold text-text">{userProfile._count.followedBy}</span> followers
              </div>
              <div className="text-text-muted">
                <span className="font-semibold text-text">{userProfile._count.following}</span> following
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-border mb-8">
        <div className="flex overflow-x-auto">
          <button 
            onClick={() => setActiveTab('prompts')} 
            className={`px-6 py-3 font-medium ${activeTab === 'prompts' ? 'border-b-2 border-primary text-primary' : 'text-text-muted hover:text-text'}`}
          >
            Prompts
          </button>
          {/* Only show Saved tab if viewing own profile */}
          {session?.user?.id === userId && (
            <button 
              onClick={() => setActiveTab('saved')} 
              className={`px-6 py-3 font-medium ${activeTab === 'saved' ? 'border-b-2 border-primary text-primary' : 'text-text-muted hover:text-text'}`}
            >
              Saved
            </button>
          )}
        </div>
      </div>
      
      {/* Content based on active tab */}
      <div>
        {activeTab === 'prompts' && (
          <>
            {prompts.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <p className="text-lg">No prompts yet</p>
                {session && session.user && session.user.id === userId && (
                  <Link href="/create" className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors">
                    Create your first prompt
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prompts.map((prompt) => (
                  <Link 
                    href={`/prompt/${prompt.id}`} 
                    key={prompt.id} 
                    className="block bg-secondary rounded-lg overflow-hidden hover:shadow-md transition-shadow border border-border"
                  >
                    {prompt.image && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={prompt.image} 
                          alt={prompt.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-1">{prompt.title}</h3>
                      <p className="text-text-muted text-sm mb-3 line-clamp-2">{prompt.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {renderStars(prompt.averageRating)}
                          <span className="ml-2 text-sm text-text-muted">
                            ({prompt._count.ratings} {prompt._count.ratings === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
        
        {activeTab === 'saved' && session?.user?.id === userId && (
          <>
            {savedPrompts.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <p className="text-lg">No saved prompts yet</p>
                <Link href="/search" className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors">
                  Explore prompts
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedPrompts.map((prompt) => (
                  <Link 
                    href={`/prompt/${prompt.id}`} 
                    key={prompt.id} 
                    className="block bg-secondary rounded-lg overflow-hidden hover:shadow-md transition-shadow border border-border"
                  >
                    {prompt.image && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={prompt.image} 
                          alt={prompt.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-1">{prompt.title}</h3>
                      <p className="text-text-muted text-sm mb-3 line-clamp-2">{prompt.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex items-center">
                            <Link href={`/profile/${prompt.user.id}`} className="flex items-center mr-2">
                              <img 
                                src={prompt.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(prompt.user.name)}&background=random`} 
                                alt={prompt.user.name} 
                                className="w-6 h-6 rounded-full mr-1"
                              />
                              <span className="text-sm text-text-muted hover:text-primary">{prompt.user.name}</span>
                            </Link>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          {renderStars(prompt.averageRating)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
