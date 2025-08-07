import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook for handling prompt save/unsave functionality
 * @param initialSavedState - Initial saved state of the prompt
 * @param promptId - ID of the prompt
 * @param onSuccess - Optional callback function to execute after successful save/unsave
 */
export function useSavePrompt(
  initialSavedState = false, 
  promptId: string,
  onSuccess?: (isSaved: boolean) => void
) {
  const [isSaved, setIsSaved] = useState(initialSavedState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  /**
   * Toggle the saved state of a prompt
   */
  const toggleSave = async () => {
    // Require login
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/prompts/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId,
          action: isSaved ? 'unsave' : 'save',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response from save API:', errorData);
        // Don't throw, just log the error and continue
      }
      
      // Toggle saved state
      setIsSaved(!isSaved);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(!isSaved);
      }
    } catch (err) {
      console.error('Error toggling save status:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSaved,
    isLoading,
    error,
    toggleSave,
  };
}
