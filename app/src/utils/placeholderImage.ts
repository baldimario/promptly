/**
 * Utility functions for generating placeholder images for prompts
 */

/**
 * Generates a placeholder image URL using UI Avatars with customized styling based on prompt data
 * 
 * @param title Prompt title to display on the placeholder
 * @param userName Username of the prompt creator (used for color generation)
 * @param categories Array of categories for the prompt (used for background pattern)
 * @returns URL string for the placeholder image
 */
export function generatePromptPlaceholder(
  title: string,
  userName: string,
  categories: string[] = []
): string {
  // Use the first 2-3 words of the title (max 20 chars)
  const words = title.split(' ');
  let displayText = '';
  let charCount = 0;

  for (let i = 0; i < Math.min(3, words.length); i++) {
    if (charCount + words[i].length <= 20) {
      displayText += (displayText ? ' ' : '') + words[i];
      charCount += words[i].length;
    } else {
      break;
    }
  }

  // Generate a background color based on categories
  let bgColor = '';
  
  if (categories.length > 0) {
    // Map common categories to specific colors
    const colorMap: Record<string, string> = {
      'writing': '6366F1', // Indigo
      'marketing': 'EC4899', // Pink
      'ai': '8B5CF6', // Violet
      'blog': '14B8A6', // Teal
      'social-media': 'F59E0B', // Amber
      'content': '10B981', // Emerald
      'coding': '3B82F6', // Blue
      'programming': '3B82F6', // Blue
      'academic': '8B5CF6', // Violet
      'business': '6366F1', // Indigo
      'creative': 'EC4899', // Pink
      'data': '3B82F6', // Blue
      'education': '14B8A6', // Teal
      'design': 'EC4899', // Pink
      'advertising': 'F59E0B', // Amber
      'product': '6366F1', // Indigo
      'travel': '10B981', // Emerald
      'health': '14B8A6', // Teal
      'chatbot': '3B82F6', // Blue
      'customer-service': 'F59E0B' // Amber
    };

    // Find the first category that matches our predefined colors
    for (const category of categories) {
      const normalizedCategory = category.toLowerCase();
      for (const [key, color] of Object.entries(colorMap)) {
        if (normalizedCategory.includes(key)) {
          bgColor = color;
          break;
        }
      }
      if (bgColor) break;
    }
  }

  // If no matching category, generate a color based on the username for consistency
  if (!bgColor) {
    // Simple hash function to convert username to a hex color
    let hash = 0;
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to hex color
    bgColor = Math.abs(hash).toString(16).substring(0, 6).padEnd(6, '0');
  }
  
  // Format the title text - encode properly for URL
  const encodedText = encodeURIComponent(displayText);
  
  // Create the UI Avatars URL with custom styling
  return `https://ui-avatars.com/api/?name=${encodedText}&background=${bgColor}&color=fff&size=300&font-size=0.33&bold=true&length=20`;
}

/**
 * Returns an appropriate image URL for a prompt, using either the provided image
 * or generating a placeholder with the prompt details
 * 
 * @param prompt The prompt object containing title, image, username and categories
 * @returns URL string for the prompt image
 */
export function getPromptImageUrl(prompt: {
  title: string;
  image?: string | null;
  userName: string;
  tags?: string[];
  categories?: string[]; // For backwards compatibility
}): string {
  // Check if we have a valid image URL
  if (prompt.image && typeof prompt.image === 'string' && prompt.image.trim() !== '') {
  // Keep relative URLs as-is to be served by Next/Image from public/
  return prompt.image;
  }
  
  // Use tags if available, fall back to categories for backward compatibility
  const keywords = (prompt.tags || prompt.categories || []).filter(Boolean);
  
  try {
    return generatePromptPlaceholder(
      prompt.title || 'Untitled Prompt',
      prompt.userName || 'Unknown User',
      keywords
    );
  } catch (error) {
    console.error('Error generating prompt placeholder:', error);
    
    // Fallback to a very simple placeholder
    const hash = (prompt.title || 'Prompt').split('').reduce(
      (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0
    );
    const bgColor = Math.abs(hash).toString(16).substring(0, 6).padEnd(6, '0');
    return `https://ui-avatars.com/api/?name=AI+Prompt&background=${bgColor}&color=fff&size=300&bold=true`;
  }
}
