'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { Button, ButtonLink } from '@/components/common/Button';

const Header = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && buttonRef.current && 
          !menuRef.current.contains(event.target as Node) && 
          !buttonRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border border-[#bada55] px-10 py-3">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4 text-text">
          <Link href="/">
            <div className="cursor-pointer">
              <Image src="/logo.png" alt="Promptly Logo" width={64} height={64} />
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-9">
          <Link href="/" className={`text-text text-sm font-medium leading-normal ${pathname === '/' ? 'font-bold' : ''}`}>
            Home
          </Link>
          <Link href="/explore" className={`text-text text-sm font-medium leading-normal ${pathname === '/explore' ? 'font-bold' : ''}`}>
            Explore
          </Link>
          <Link href="/create" className={`text-text text-sm font-medium leading-normal ${pathname === '/create' ? 'font-bold' : ''}`}>
            Create
          </Link>
        </div>
      </div>
      <div className="flex flex-1 justify-end gap-8">
        <form 
          className="flex flex-col min-w-40 !h-10 max-w-64" 
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            }
          }}
        >
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
            <button 
              type="submit" 
              className="text-text-muted flex border-none bg-input items-center justify-center pl-4 rounded-l-xl border-r-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor"
                viewBox="0 0 256 256">
                <path
                  d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z">
                </path>
              </svg>
            </button>
            <input 
              placeholder="Search"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text focus:outline-0 focus:ring-0 border-none bg-input focus:border-none h-full placeholder:text-text-muted px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
            />
          </div>
        </form>
        
        {isAuthenticated ? (
          <>
            <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-secondary text-text gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
              <div className="text-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor"
                  viewBox="0 0 256 256">
                  <path
                    d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z">
                  </path>
                </svg>
              </div>
            </button>
            <div className="relative">
              <Link 
                ref={buttonRef}
                href="#" 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 block"
                style={{ backgroundImage: `url("${session?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || 'User')}&background=random`}")` }}
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(!isMenuOpen);
                }}
              >
              </Link>
              {isMenuOpen && (
                <div 
                  ref={menuRef}
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-border z-10 overflow-hidden"
                  style={{ backgroundColor: 'var(--background)' }}
                >
                  <div className="py-1 bg-background">
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-text hover:bg-secondary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      href="/create" 
                      className="block px-4 py-2 text-sm text-text hover:bg-secondary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Create Prompt
                    </Link>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        signOut();
                      }} 
                      className="block w-full text-left px-4 py-2 text-sm text-text hover:bg-secondary"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            <ButtonLink href="/signup" variant="accent" size="sm">
              Sign up
            </ButtonLink>
            <ButtonLink href="/login" variant="secondary" size="sm">
              Log in
            </ButtonLink>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
