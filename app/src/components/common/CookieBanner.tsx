'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      // If no cookie consent found, show the banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50 backdrop-blur-sm" style={{ backgroundColor: 'rgba(var(--background-rgb), 0.95)' }}>
      <div className="max-w-7xl mx-auto p-4 md:px-6 md:py-5 flex flex-col md:flex-row items-center justify-between">
        <div className="flex-1 mb-4 md:mb-0 md:mr-6">
          <h3 className="text-text font-semibold text-base">We use cookies</h3>
          <p className="text-text-muted text-sm mt-1">
            This website uses cookies to enhance your browsing experience and analyze site traffic. 
            See our{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>{' '}
            to learn more.
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={declineCookies}
            className="py-2 px-4 text-sm font-medium text-text border border-border rounded-full hover:bg-secondary"
          >
            Decline
          </button>
          <button
            onClick={acceptCookies}
            className="py-2 px-4 text-sm font-medium text-background bg-primary rounded-full hover:bg-primary/90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
