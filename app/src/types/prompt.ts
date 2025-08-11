export interface Prompt {
  id: string;
  title: string;
  description: string;
  promptText: string;
  exampleOutputs?: string;
  suggestedModel: string;
  image?: string;
  imageUrls?: string[];
  userId: string;
  userName: string;
  userImage?: string;
  createdAt: string;
  ratings: number;
  numRatings: number;
  comments: Comment[];
  // Old categories field kept for backward compatibility
  categories?: string[];
  // New category fields
  categoryId?: string;
  categoryName?: string;
  categoryImage?: string;
  // New tags field
  tags?: string[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  text: string;
  createdAt: string;
}


export interface Category {
  id: string;
  name: string;
  image?: string;
  description?: string;
}

export interface PromptFormData {
  title: string;
  description: string;
  promptText: string;
  exampleOutputs?: string;
  suggestedModel: string;
  categoryId?: string;
  tags?: string[];
  outputImages?: File[];
}
