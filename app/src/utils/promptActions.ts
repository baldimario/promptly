/**
 * Utility functions for prompt-related actions
 */

/**
 * Save or unsave a prompt
 * @param promptId - The ID of the prompt to save/unsave
 * @param action - Whether to 'save' or 'unsave' the prompt
 * @returns Promise with the result of the operation
 */
export async function togglePromptSave(promptId: string, action: 'save' | 'unsave') {
  const response = await fetch('/api/prompts/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      promptId,
      action,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to ${action} prompt`);
  }

  return await response.json();
}

/**
 * Rate a prompt
 * @param promptId - The ID of the prompt to rate
 * @param rating - Rating value (1-5)
 * @returns Promise with the result of the operation
 */
export async function ratePrompt(promptId: string, rating: number) {
  const response = await fetch(`/api/prompts/${promptId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'rate',
      content: rating
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to submit rating');
  }

  return await response.json();
}

/**
 * Comment on a prompt
 * @param promptId - The ID of the prompt to comment on
 * @param comment - Comment text
 * @returns Promise with the result of the operation
 */
export async function commentOnPrompt(promptId: string, comment: string) {
  const response = await fetch(`/api/prompts/${promptId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'comment',
      content: comment
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to submit comment');
  }

  return await response.json();
}
