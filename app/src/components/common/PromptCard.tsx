import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TagDisplay from '@/components/common/TagDisplay';
import CategoryBadge from '@/components/common/CategoryBadge';
import SaveButton from '@/components/common/SaveButton';
import { RatingDisplay } from '@/components/common/RatingStars';
import { getPromptImageUrl } from '@/utils/placeholderImage';

export interface PromptCardProps {
  id: string;
  title: string;
  description: string;
  image?: string;
  tags?: string[];
  categoryId?: string | null;
  categoryName?: string;
  categoryImage?: string;
  userName: string;
  userImage?: string;
  createdAt: string;
  rating: number;
  numRatings: number;
  suggestedModel?: string;
  userId?: string; // Optional user ID for profile navigation
  hideAuthor?: boolean; // Optional flag to hide author info
  isSaved?: boolean; // Whether the prompt is saved by the current user
  onSaveToggle?: (id: string, isSaved: boolean) => void; // Callback when save status changes
}

const PromptCard: React.FC<PromptCardProps> = ({
  id,
  title,
  description,
  image,
  tags = [],
  categoryId,
  categoryName,
  categoryImage,
  userName,
  userImage,
  createdAt,
  rating,
  numRatings,
  suggestedModel,
  userId,
  hideAuthor = false,
  isSaved = false,
  onSaveToggle
}) => {
  // Generate avatar URL if needed
  const avatarUrl = userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;

  return (
    <div className="group rounded-lg border border-border border-[#bada55] bg-background overflow-hidden flex flex-col h-full transition-all hover:border-white hover:shadow-md">
      {/* Prompt image - wrap in Link */}
      <Link href={`/prompt/${id}`} className="block aspect-[2/1] relative overflow-hidden bg-gradient-to-r from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-900">
        <Image
          src={getPromptImageUrl({
            title,
            image,
            userName,
            tags
          })}
          alt={title}
          fill
          className="object-cover"
          unoptimized={true}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target && !image) {
              const hash = title.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
              const bgColor = Math.abs(hash).toString(16).substring(0, 6).padEnd(6, '0');
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=${bgColor}&color=fff&size=300&bold=true`;
            }
          }}
        />
      </Link>
        
      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex justify-between items-start gap-2 mb-1">
          {/* Title - wrap in Link */}
          <Link href={`/prompt/${id}`} className="block flex-1">
            <h3 className="text-text font-bold line-clamp-2 group-hover:text-[#bada55] transition-colors">
              {title}
            </h3>
          </Link>
          
          {/* Save button */}
          <SaveButton 
            promptId={id}
            initialSaved={isSaved}
            size="sm"
            onSaveChange={(isSaved) => onSaveToggle?.(id, isSaved)}
          />
        </div>
        
        {/* Description */}
        <p className="text-text-muted text-sm mb-3 line-clamp-2">
          {description}
        </p>
          
        {/* Category and Tags */}
        <div className="mt-auto space-y-2">
          {categoryId && (
            <div>
              <CategoryBadge 
                categoryId={categoryId}
                categoryName={categoryName}
                categoryImage={categoryImage}
                size="sm"
                clickable={true}
                insidePromptCard={true}
              />
            </div>
          )}
          {tags && tags.length > 0 && (
            <TagDisplay tags={tags} clickable={true} maxDisplay={3} insidePromptCard={true} />
          )}
        </div>
          
        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          {/* User info */}
          {!hideAuthor && (
            userId ? (
              <Link href={`/profile/${userId}`} className="flex items-center hover:text-[#bada55]">
                <div className="w-6 h-6 rounded-full overflow-hidden mr-2 bg-gradient-to-r from-blue-400 to-purple-500">
                  <Image
                    src={avatarUrl}
                    alt={userName}
                    width={24}
                    height={24}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <span className="text-xs text-text-muted truncate max-w-[100px] hover:text-[#bada55]">
                  {userName}
                </span>
              </Link>
            ) : (
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full overflow-hidden mr-2 bg-gradient-to-r from-blue-400 to-purple-500">
                  <Image
                    src={avatarUrl}
                    alt={userName}
                    width={24}
                    height={24}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <span className="text-xs text-text-muted truncate max-w-[100px]">
                  {userName}
                </span>
              </div>
            )
          )}
          
          {/* Rating */}
          <RatingDisplay rating={rating} numRatings={numRatings} size="sm" />
        </div>
      </div>
    </div>
  );
};

export default PromptCard;
