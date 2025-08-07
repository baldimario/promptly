'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function EditProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Check if user is authenticated and fetch profile data
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    const fetchUserProfile = async () => {
      if (status === 'authenticated' && session?.user) {
        try {
          const response = await fetch('/api/users/profile');
          
          if (!response.ok) {
            throw new Error('Failed to fetch profile data');
          }
          
          const data = await response.json();
          // Initialize form with user data from database
          setName(data.user.name || session.user.name || '');
          setBio(data.user.bio || ''); // Use actual bio from database
          setAvatar(data.user.image || session.user.image || '');
          setPreviewAvatar(data.user.image || session.user.image || '');
        } catch (err) {
          console.error('Error fetching profile:', err);
          // Fall back to session data if API call fails
          setName(session.user.name || '');
          setBio(''); 
          setAvatar(session.user.image || '');
          setPreviewAvatar(session.user.image || '');
        }
      }
    };
    
    if (status === 'authenticated') {
      fetchUserProfile();
    }
  }, [status, router, session]);

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Only use base64 preview URL for the frontend display
      // For the backend, we'll continue using the original avatar URL to avoid database size issues
      // If we had new image data, we'd upload it to a service like AWS S3 or Cloudinary first
      
      let avatarUrl = avatar;
      // We don't send the base64 data to the backend to avoid database issues
      // Instead we'll use UI Avatars service that generates avatars based on user name
      // This is handled in the profile page components using the user's name
      
      // Create userData for API call - send avatar url only if it's not a base64 string
      const userData = {
        name,
        bio,
        avatar: avatarUrl && !avatarUrl.startsWith('data:image') ? avatarUrl : null,
      };
      
      // Call the API to update the user profile
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      // Keep the previewed image for the current session, but don't store base64 in the database
      const sessionImage = avatarFile ? previewAvatar : userData.avatar;
      
      // Update session to reflect changes immediately
      await update({
        ...session,
        user: {
          ...session?.user,
          name,
          // We show the uploaded image in the session, even though it's not stored in the DB
          image: sessionImage,
        },
      });
      
      setSuccess('Profile updated successfully!');
      
      // Store the preview locally if needed
      if (avatarFile) {
        try {
          localStorage.setItem('userAvatarPreview', previewAvatar);
        } catch (e) {
          // Handle any local storage errors
          console.warn('Could not save avatar preview to local storage', e);
        }
      }
      
      // Navigate back to profile page after a short delay
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 justify-center py-5 px-4 md:px-8 lg:px-16 xl:px-40">
      <div className="flex flex-col max-w-[960px] flex-1">
        <div className="flex items-center mb-6">
          <Link href="/profile" className="mr-4">
            <div className="flex items-center text-text hover:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </div>
          </Link>
          <h1 className="text-text text-2xl font-bold leading-tight">Edit Profile</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-secondary rounded-lg p-6 shadow-sm">
          {/* Avatar section */}
          <div className="flex flex-col items-center mb-8">
            <div 
              className="relative bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 cursor-pointer"
              style={{ backgroundImage: `url("${previewAvatar}")` }}
              onClick={triggerFileInput}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 rounded-full transition-opacity duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <p className="text-text-muted text-sm mt-2">Click to change avatar</p>
          </div>
          
          {/* Name input */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-text font-medium mb-2">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-xl bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your name"
              required
            />
          </div>
          
          {/* Bio input */}
          <div className="mb-6">
            <label htmlFor="bio" className="block text-text font-medium mb-2">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-xl bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Tell us about yourself"
              rows={4}
            />
            <p className="text-text-muted text-xs mt-1">Brief description for your profile.</p>
          </div>
          
          {/* Error and success messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              {success}
            </div>
          )}
          
          {/* Submit button */}
          <div className="flex justify-end">
            <Link href="/profile" className="mr-4">
              <button 
                type="button"
                className="px-6 py-2 border border-border rounded-xl text-text hover:bg-background/80"
                disabled={loading}
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
