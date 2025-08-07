'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { Fragment, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Modal from '@/components/common/Modal';
import TagDisplay from '@/components/common/TagDisplay';
import CategoryBadge from '@/components/common/CategoryBadge';
import SaveButton from '@/components/common/SaveButton';
import { RatingDisplay, InteractiveRating } from '@/components/common/RatingStars';
import useModal from '@/hooks/useModal';
import { getPromptImageUrl } from '@/utils/placeholderImage';
import { formatRelativeTime } from '@/utils/dateFormat';
import { ratePrompt, commentOnPrompt } from '@/utils/promptActions';

import { Prompt, Comment } from '@/types/prompt';

export default function PromptDetail() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { isOpen, modalProps, showModal, hideModal, onConfirm } = useModal();
  
  // Get the ID from the params object using useParams() hook
  const promptId = params.id as string;

  // Fetch prompt data
  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/prompts/${promptId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch prompt');
        }
        
        const data = await response.json();
        setPrompt(data.prompt);
        // Set saved state if available in the response
        if (data.prompt.isSaved !== undefined) {
          setIsSaved(data.prompt.isSaved);
        }
      } catch (error) {
        console.error('Error fetching prompt:', error);
        setError('Failed to load prompt. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrompt();
  }, [promptId]);

  const handleCommentSubmit = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    if (!comment.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      const data = await commentOnPrompt(promptId, comment);
      
      // Add the new comment to the prompt
      setPrompt(prev => {
        if (!prev) return null;
        
        const newComments = prev.comments ? [...prev.comments, data.comment] : [data.comment];
        return { ...prev, comments: newComments };
      });
      
      // Clear the comment input
      setComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      showModal({
        title: 'Comment Error',
        message: 'Failed to submit comment. Please try again.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleRatingSubmit = async (selectedRating: number) => {
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      setRatingSubmitting(true);
      const data = await ratePrompt(promptId, selectedRating);
      
      // Update the prompt with the new rating
      setPrompt(prev => {
        if (!prev) return null;
        
        return { 
          ...prev, 
          ratings: data.rating,
          numRatings: data.numRatings 
        };
      });
      
      // Set the user's rating
      setRating(selectedRating);
      
      // Show success message
      showModal({
        title: 'Rating Submitted',
        message: 'Thank you for rating this prompt!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
      showModal({
        title: 'Rating Error',
        message: 'Failed to submit rating. Please try again.',
        type: 'error'
      });
    } finally {
      setRatingSubmitting(false);
    }
  };
  
  const handleSaveSuccess = (newSavedState: boolean) => {
    // Show success message
    showModal({
      title: newSavedState ? 'Prompt Saved' : 'Prompt Removed',
      message: newSavedState 
        ? 'Prompt saved to your collection.' 
        : 'Prompt removed from your saved collection.',
      type: 'success'
    });
  };
  
  // Removed formatRelativeTime function as we now import it from utils/dateFormat
  
  // Removed renderStars function as we now use the RatingDisplay component
  
  // Removed RatingStars component as we now use the InteractiveRating component

  if (loading) {
    return (
      <div className="flex flex-1 justify-center py-5 px-4 md:px-8 lg:px-16 xl:px-40">
        <div className="flex flex-col max-w-[960px] flex-1 items-center justify-center min-h-[60vh]">
          <p className="text-text text-xl">Loading prompt details...</p>
        </div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="flex flex-1 justify-center py-5 px-4 md:px-8 lg:px-16 xl:px-40">
        <div className="flex flex-col max-w-[960px] flex-1 items-center justify-center min-h-[60vh]">
          <p className="text-text text-xl">{error || 'Prompt not found'}</p>
          <Link href="/explore" className="text-primary mt-4 hover:underline">
            Go back to explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 justify-center py-5 px-4 md:px-8 lg:px-16 xl:px-40">
      <div className="flex flex-col max-w-[960px] flex-1">
        <div className="flex flex-wrap gap-2 p-4">
          <Link className="text-text-muted text-base font-medium leading-normal" href="/explore">
            Explore
          </Link>
          <span className="text-text-muted text-base font-medium leading-normal">/</span>
          <span className="text-text text-base font-medium leading-normal">Prompt Details</span>
        </div>

        <div className="flex flex-wrap justify-between gap-3 p-4">
          {/* Main prompt image */}
          <div className="w-full mb-6">
            <div className="aspect-[2/1] relative overflow-hidden rounded-lg">
              <Image
                src={getPromptImageUrl({
                  title: prompt.title,
                  image: prompt.image,
                  userName: prompt.userName,
                  tags: prompt.tags || []
                })}
                alt={prompt.title}
                fill
                className="object-cover"
                priority
                unoptimized={!prompt.image} // Unoptimized for external placeholder images
              />
            </div>
          </div>
          
          <div className="flex min-w-72 flex-col gap-3">
            <div className="flex justify-between items-start">
              <h1 className="text-text tracking-light text-[32px] font-bold leading-tight">
                {prompt.title}
              </h1>
              
              <div className="flex items-center space-x-2">
                {/* Save button */}
                <SaveButton 
                  promptId={promptId}
                  initialSaved={isSaved}
                  size="lg"
                  onSaveChange={handleSaveSuccess}
                />
                
                {/* Edit button (gear icon) - Only visible to the prompt owner */}
                {session?.user?.id === prompt.userId && (
                  <Link 
                    href={`/prompt/edit/${prompt.id}`}
                    className="p-2 rounded-full hover:bg-border transition-colors"
                    title="Edit prompt"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                  </Link>
                )}
              </div>
            </div>
            <p className="text-text-muted text-sm font-normal leading-normal">
              {prompt.description}
            </p>
            
            {/* Author information */}
            <div className="flex items-center mt-1 mb-2">
              <Link href={`/profile/${prompt.userId}`} className="flex items-center group">
                <div className="w-8 h-8 rounded-full overflow-hidden mr-3 border border-border">
                  <Image 
                    src={prompt.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(prompt.userName)}&background=random`}
                    alt={prompt.userName} 
                    width={32} 
                    height={32} 
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <p className="font-medium text-text group-hover:text-primary transition-colors">{prompt.userName}</p>
                  <p className="text-sm text-text-muted">{new Date(prompt.createdAt).toLocaleDateString()}</p>
                </div>
              </Link>
            </div>
            
            {/* Category and Tags */}
            <div className="space-y-3 mt-2">
              {/* Category */}
              {prompt.categoryId && (
                <div>
                  <CategoryBadge 
                    categoryId={prompt.categoryId}
                    categoryName={prompt.categoryName}
                    categoryImage={prompt.categoryImage}
                    clickable={true}
                  />
                </div>
              )}
              
              {/* Tags */}
              {prompt.tags && prompt.tags.length > 0 && (
                <TagDisplay tags={prompt.tags} clickable={true} />
              )}
            </div>
          </div>
        </div>

        <h2 className="text-text text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Prompt</h2>
        <p className="text-text text-base font-normal leading-normal pb-3 pt-1 px-4 whitespace-pre-wrap">
          {prompt.promptText}
        </p>

        <h2 className="text-text text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Suggested Model</h2>
        <p className="text-text text-base font-normal leading-normal pb-3 pt-1 px-4">
          {prompt.suggestedModel}
        </p>

        <h2 className="text-text text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Example Output</h2>
        {prompt.exampleOutputs && (
          <p className="text-text text-base font-normal leading-normal pb-3 pt-1 px-4 whitespace-pre-wrap">
            {prompt.exampleOutputs}
          </p>
        )}
        
        {/* Display output images if available */}
        {prompt.imageUrls && prompt.imageUrls.length > 0 && (
          <div className="px-4 py-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {prompt.imageUrls.map((imageUrl, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                  <Image 
                    src={imageUrl} 
                    alt={`Example output ${index + 1}`} 
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-text text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Ratings</h2>
        <div className="flex flex-wrap gap-x-8 gap-y-6 p-4">
          <div className="flex flex-col gap-2">
            <p className="text-text text-4xl font-black leading-tight tracking-[-0.033em]">{prompt.ratings.toFixed(1)}</p>
            <div className="flex gap-0.5">
              <RatingDisplay rating={prompt.ratings} numRatings={prompt.numRatings} size="sm" showCount={false} />
            </div>
            <p className="text-text text-base font-normal leading-normal">{prompt.numRatings} reviews</p>
          </div>

          <div className="grid min-w-[200px] max-w-[400px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
            {[5, 4, 3, 2, 1].map((star) => (
              <Fragment key={star}>
                <p className="text-text text-sm font-normal leading-normal">{star}</p>
                <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-border/50">
                  <div className="rounded-full bg-text" style={{ width: star === 5 ? '70%' : star === 4 ? '20%' : '0%' }}></div>
                </div>
                <p className="text-text-muted text-sm font-normal leading-normal text-right">
                  {star === 5 ? '70.00%' : star === 4 ? '20.00%' : '0.00%'}
                </p>
              </Fragment>
            ))}
          </div>
          
          {session && (
            <div className="flex flex-col ml-4 mt-4">
              <p className="text-text text-sm font-semibold">Rate this prompt:</p>
              <InteractiveRating
                rating={rating}
                hoverRating={hoverRating}
                isSubmitting={ratingSubmitting}
                size="lg"
                onRatingChange={handleRatingSubmit}
                onHoverChange={setHoverRating}
              />
              {ratingSubmitting && <p className="text-text-muted text-sm mt-2">Submitting...</p>}
            </div>
          )}
        </div>

        <h2 className="text-text text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Comments</h2>
        <div className="flex items-center px-4 py-3 gap-3">
          <label className="flex flex-col min-w-40 h-full flex-1">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
              <div className="flex border border-border bg-background justify-end pl-[15px] pr-[15px] pt-[15px] rounded-l-xl border-r-0">
                <div className="rounded-full size-10 shrink-0 overflow-hidden border border-border">
                  <Image
                    src={session?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || 'User')}&background=random`}
                    alt={session?.user?.name || "User"}
                    width={40}
                    height={40}
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
              <div className="flex flex-1 flex-col">
                <textarea 
                  placeholder={session ? "Add a comment..." : "Sign in to comment"}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={!session || submitting}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text focus:outline-0 focus:ring-0 border border-border bg-background focus:border-primary h-auto placeholder:text-text-muted rounded-l-none border-l-0 pl-2 rounded-b-none border-b-0 text-base font-normal leading-normal pt-[22px]"
                >
                </textarea>
                <div className="flex border border-border bg-background justify-end pr-[15px] rounded-br-xl border-l-0 border-t-0 px-[15px] pb-[15px]">
                  <div className="flex items-center gap-4 justify-end">
                    <button
                      onClick={handleCommentSubmit}
                      disabled={!session || submitting || !comment.trim()}
                      className="min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-primary text-background text-sm font-medium leading-normal hidden sm:flex disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="truncate">{submitting ? 'Submitting...' : 'Submit'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </label>
        </div>
        
        {prompt.comments && prompt.comments.length > 0 ? (
          prompt.comments.map((comment) => (
            <div key={comment.id} className="flex w-full flex-row items-start justify-start gap-3 p-4">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 shrink-0 overflow-hidden border border-border">
                <Image 
                  src={comment.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}&background=random`}
                  alt={comment.userName}
                  width={40}
                  height={40}
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex h-full flex-1 flex-col items-start justify-start">
                <div className="flex w-full flex-row items-start justify-start gap-x-3">
                  <p className="text-text text-sm font-bold leading-normal tracking-[0.015em]">{comment.userName}</p>
                  <p className="text-text-muted text-sm font-normal leading-normal">{formatRelativeTime(comment.createdAt)}</p>
                </div>
                <p className="text-text text-sm font-normal leading-normal">
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-text-muted text-sm px-4">No comments yet. Be the first to comment!</p>
        )}
      </div>
      
      {/* Modal component */}
      <Modal
        isOpen={isOpen}
        onClose={hideModal}
        title={modalProps.title}
        message={modalProps.message}
        type={modalProps.type}
        confirmText={modalProps.confirmText}
        cancelText={modalProps.cancelText}
        onConfirm={onConfirm}
      />
    </div>
  );
}
