import React from 'react';

interface RatingDisplayProps {
  rating: number;
  numRatings?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

interface InteractiveRatingProps {
  rating: number;
  hoverRating: number;
  isSubmitting?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onRatingChange: (rating: number) => void;
  onHoverChange: (rating: number) => void;
}

/**
 * Static component for displaying rating stars
 */
export const RatingDisplay: React.FC<RatingDisplayProps> = ({ 
  rating, 
  numRatings, 
  size = 'sm',
  showCount = true,
  className = ''
}) => {
  const starSize = size === 'lg' ? '18px' : size === 'md' ? '16px' : '14px';

  return (
    <div className={`flex gap-0.5 items-center ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <div key={star} className="text-text">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={starSize} 
            height={starSize} 
            fill="currentColor" 
            viewBox="0 0 256 256"
            className={star <= Math.round(rating) ? "text-yellow-500" : "text-border"}
          >
            <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path>
          </svg>
        </div>
      ))}
      {showCount && numRatings !== undefined && (
        <span className="text-text-muted text-xs ml-1">({numRatings})</span>
      )}
    </div>
  );
};

/**
 * Interactive component for star ratings
 */
export const InteractiveRating: React.FC<InteractiveRatingProps> = ({
  rating,
  hoverRating,
  isSubmitting = false,
  size = 'md',
  className = '',
  onRatingChange,
  onHoverChange
}) => {
  const starSize = size === 'lg' ? '28px' : size === 'md' ? '24px' : '20px';
  
  return (
    <div className={`flex gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={isSubmitting}
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => onHoverChange(star)}
          onMouseLeave={() => onHoverChange(0)}
          className="text-text hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Rate ${star} stars`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={starSize} 
            height={starSize} 
            fill="currentColor" 
            viewBox="0 0 256 256"
            className={`${(hoverRating || rating) >= star ? 'text-yellow-500' : 'text-border'}`}
          >
            <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path>
          </svg>
        </button>
      ))}
    </div>
  );
};
