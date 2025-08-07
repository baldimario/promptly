'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  onConfirm,
  cancelText
}: ModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
    
    // Add body class to prevent scrolling when modal is open
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Function to get color based on type
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          )
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          )
        };
      default:
        return {
          bg: 'bg-primary',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          )
        };
    }
  };

  const { bg, icon } = getTypeStyles();

  if (!isMounted || !isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div 
        className="fixed inset-0 bg-black/20" 
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      <div className="relative bg-background rounded-xl shadow-lg border border-border w-full max-w-md overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-full ${bg} text-background`}>
              {icon}
            </div>
            <h3 className="text-text text-xl font-bold">{title}</h3>
          </div>
          
          <p className="text-text-muted mb-6">{message}</p>
          
          <div className="flex justify-end gap-3">
            {cancelText && (
              <button
                className="px-4 py-2 rounded-full border border-border text-text hover:bg-border/10 transition-colors"
                onClick={onClose}
              >
                {cancelText}
              </button>
            )}
            <button
              className="px-4 py-2 rounded-full bg-primary text-background hover:bg-primary/90 transition-colors"
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
