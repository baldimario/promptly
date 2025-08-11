'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';
import Modal from '@/components/common/Modal';
import CategorySelect from '@/components/common/CategorySelect';
import TagInput from '@/components/common/TagInput';
import useModal from '@/hooks/useModal';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import MarkdownEditor from '@/components/common/MarkdownEditor';

export default function EditPrompt() {
  const { user, isAuthenticated, loading: authLoading } = useAuth({ required: true });
  const router = useRouter();
  const params = useParams();
  const { isOpen, modalProps, showModal, hideModal, onConfirm } = useModal();
  const [formData, setFormData] = useState({
    title: '',
    promptText: '',
    description: '',
    exampleOutputs: '',
    suggestedModel: ''
  });
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [outputImages, setOutputImages] = useState<File[]>([]);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Get the ID from the params object using useParams() hook
  const promptId = params.id as string;
  
  // Available AI models
  const aiModels = [
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
    { value: 'mistral-large', label: 'Mistral Large' },
    { value: 'mistral-medium', label: 'Mistral Medium' },
    { value: 'mistral-small', label: 'Mistral Small' },
    { value: 'llama-3', label: 'Llama 3' },
    { value: 'palm-2', label: 'PaLM 2' },
    { value: 'other', label: 'Other' }
  ];

  // Fetch the prompt data on load
  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/prompts/${promptId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch prompt');
        }
        
        const data = await response.json();
        const prompt = data.prompt;
        
        // Check if the current user is the author
        if (user && prompt.userId === user.id) {
          setIsAuthorized(true);
          
          // Fill the form with existing data
          setFormData({
            title: prompt.title || '',
            promptText: prompt.promptText || '',
            description: prompt.description || '',
            exampleOutputs: prompt.exampleOutputs || '',
            suggestedModel: prompt.suggestedModel || ''
          });
          
          // Set category
          setCategoryId(prompt.categoryId || null);
          
          // Set tags
          setTags(prompt.tags || []);
          
          // Set existing images
          if (prompt.imageUrls && prompt.imageUrls.length > 0) {
            setExistingImageUrls(prompt.imageUrls);
            setImagesPreviews(prompt.imageUrls);
          }
        } else {
          setIsAuthorized(false);
          setError('You are not authorized to edit this prompt');
        }
      } catch (error) {
        console.error('Error fetching prompt:', error);
        setError('Failed to load prompt. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchPrompt();
    }
  }, [promptId, isAuthenticated, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newOutputImages = [...outputImages];
    const newImagePreviews = [...imagesPreviews];
    
    Array.from(files).forEach(file => {
      // Only allow images
      if (!file.type.startsWith('image/')) return;
      
      // Add to files array
      newOutputImages.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newImagePreviews.push(e.target.result as string);
          setImagesPreviews([...newImagePreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    setOutputImages(newOutputImages);
    
    // Reset the file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeImage = (index: number) => {
    // Check if it's an existing image or a new one
    if (index < existingImageUrls.length) {
      const newExistingUrls = [...existingImageUrls];
      newExistingUrls.splice(index, 1);
      setExistingImageUrls(newExistingUrls);
    } else {
      const adjustedIndex = index - existingImageUrls.length;
      const newOutputImages = [...outputImages];
      newOutputImages.splice(adjustedIndex, 1);
      setOutputImages(newOutputImages);
    }
    
    // Update preview
    const newPreviews = [...imagesPreviews];
    newPreviews.splice(index, 1);
    setImagesPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!formData.title || !formData.promptText || !formData.description || !formData.suggestedModel) {
      showModal({
        title: 'Missing Information',
        message: 'Please fill in all required fields: title, prompt text, description, and suggested model.',
        type: 'error'
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create form data for the API call
      const apiFormData = new FormData();
      
      // Add text fields
      apiFormData.append('title', formData.title);
      apiFormData.append('promptText', formData.promptText);
      apiFormData.append('description', formData.description);
      apiFormData.append('exampleOutputs', formData.exampleOutputs);
      apiFormData.append('suggestedModel', formData.suggestedModel);
      
      // Add category ID and tags separately
      if (categoryId) {
        apiFormData.append('categoryId', categoryId);
      }
      
      // Convert array of tags to JSON string for API
      apiFormData.append('tags', JSON.stringify(tags));
      
      // Add output images
      outputImages.forEach(image => {
        apiFormData.append('outputImages', image);
      });
      
      // Add list of existing images to keep
      apiFormData.append('existingImages', JSON.stringify(existingImageUrls));
      
      // Make the API call to update the prompt
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'PUT',
        body: apiFormData,
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Show success message and redirect
      showModal({
        title: 'Success',
        message: 'Prompt updated successfully!',
        type: 'success',
        onConfirm: () => router.push(`/prompt/${promptId}`)
      });
    } catch (error) {
      console.error('Error updating prompt:', error);
      showModal({
        title: 'Error',
        message: 'Failed to update prompt. Please try again.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-1 justify-center items-center py-5 px-4 md:px-8 lg:px-16 xl:px-40">
        <div className="text-text">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // The useAuth hook will redirect to login
  }

  if (error || !isAuthorized) {
    return (
      <div className="flex flex-1 justify-center py-5 px-4 md:px-8 lg:px-16 xl:px-40">
        <div className="flex flex-col max-w-[960px] flex-1 items-center justify-center min-h-[60vh]">
          <p className="text-text text-xl">{error || 'You are not authorized to edit this prompt'}</p>
          <Link href={`/prompt/${promptId}`} className="text-primary mt-4 hover:underline">
            Go back to prompt
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 justify-center py-5 px-4 md:px-8 lg:px-16 xl:px-40">
      <div className="flex flex-col w-full max-w-[640px] py-5 flex-1">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <h1 className="text-text tracking-light text-[32px] font-bold leading-tight min-w-72">Edit your prompt</h1>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Prompt Title */}
          <div className="flex max-w-[640px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <span className="text-sm font-medium mb-1 text-text-muted">Title <span className="text-red-500">*</span></span>
              <input 
                name="title"
                placeholder="Give your prompt a descriptive title"
                value={formData.title}
                onChange={handleChange}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text focus:outline-0 focus:ring-0 border border-border bg-background focus:border-primary h-14 placeholder:text-text-muted p-[15px] text-base font-normal leading-normal"
                required
              />
            </label>
          </div>
          
          {/* Prompt Text (Markdown) */}
          <div className="flex max-w-[640px] flex-wrap gap-4 px-4 py-3">
            <div className="flex flex-col min-w-40 flex-1">
              <MarkdownEditor
                label="Prompt Text"
                value={formData.promptText}
                onChange={(val) => setFormData(prev => ({ ...prev, promptText: val }))}
                required
                placeholder="Enter the prompt using markdown (code blocks, lists, etc.)"
                minHeight={240}
              />
            </div>
          </div>
          
          {/* Description */}
          <div className="flex max-w-[640px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <span className="text-sm font-medium mb-1 text-text-muted">Description <span className="text-red-500">*</span></span>
              <textarea 
                name="description"
                placeholder="Describe what your prompt does and how it can be used"
                value={formData.description}
                onChange={handleChange}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text focus:outline-0 focus:ring-0 border border-border bg-background focus:border-primary min-h-36 placeholder:text-text-muted p-[15px] text-base font-normal leading-normal"
                required
              />
            </label>
          </div>
          
          {/* Example Outputs (Markdown) */}
          <div className="flex max-w-[640px] flex-wrap gap-4 px-4 py-3">
            <div className="flex flex-col min-w-40 flex-1">
              <MarkdownEditor
                label="Example Outputs"
                value={formData.exampleOutputs}
                onChange={(val) => setFormData(prev => ({ ...prev, exampleOutputs: val }))}
                placeholder="Provide example outputs using markdown (optional)"
                minHeight={200}
              />
            </div>
          </div>
          
          {/* Output Images */}
          <div className="flex max-w-[640px] flex-wrap items-end gap-4 px-4 py-3">
            <div className="flex flex-col min-w-40 flex-1">
              <span className="text-sm font-medium mb-1 text-text-muted">Output Images</span>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-3 mb-2">
                  {imagesPreviews.map((preview, index) => (
                    <div key={index} className="relative h-24 w-24 rounded-lg overflow-hidden border border-border">
                      <Image 
                        src={preview} 
                        alt={`Output image ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized={preview.startsWith('data:')}
                      />
                      <button 
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-24 w-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-text-muted hover:border-primary hover:text-primary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
                
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-text-muted">Add images that showcase example outputs from your prompt</p>
              </div>
            </div>
          </div>
          
          {/* Suggested Model */}
          <div className="flex max-w-[640px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <span className="text-sm font-medium mb-1 text-text-muted">Suggested AI Model <span className="text-red-500">*</span></span>
              <select
                name="suggestedModel"
                value={formData.suggestedModel}
                onChange={handleChange}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text focus:outline-0 focus:ring-0 border border-border bg-background focus:border-primary h-14 placeholder:text-text-muted p-[15px] text-base font-normal leading-normal appearance-none bg-[length:20px_20px] bg-[right_15px_center] bg-no-repeat pr-12"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724px%27 height=%2724px%27 fill=%27currentColor%27 viewBox=%270 0 256 256%27%3e%3cpath d=%27M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z%27%3e%3c/path%3e%3c/svg%3e')`
                }}
                required
              >
                <option value="">Select an AI model</option>
                {aiModels.map((model) => (
                  <option key={model.value} value={model.value}>{model.label}</option>
                ))}
              </select>
            </label>
          </div>
          
          {/* Category Selection */}
          <div className="flex max-w-[640px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <span className="text-sm font-medium mb-1 text-text-muted">Category</span>
              <CategorySelect
                value={categoryId}
                onChange={setCategoryId}
                className="w-full"
              />
              <p className="text-xs text-text-muted mt-1">Select a primary category for your prompt</p>
            </label>
          </div>
          
          {/* Tags */}
          <div className="flex max-w-[640px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <span className="text-sm font-medium mb-1 text-text-muted">Tags</span>
              <TagInput
                value={tags}
                onChange={setTags}
                placeholder="Add tags for your prompt..."
                maxTags={10}
              />
              <p className="text-xs text-text-muted mt-1">Add tags like marketing, content writing, story generation</p>
            </label>
          </div>
          
          {/* Submit and Cancel Buttons */}
          <div className="flex px-4 py-3 justify-end gap-3">
            <Link 
              href={`/prompt/${promptId}`}
              className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 border border-border bg-background text-text text-sm font-bold leading-normal tracking-[0.015em]"
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={submitting}
              className={`flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-primary text-background text-sm font-bold leading-normal tracking-[0.015em] ${submitting ? 'opacity-70' : ''}`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="truncate">Saving...</span>
                </>
              ) : (
                <span className="truncate">Save Changes</span>
              )}
            </button>
          </div>
        </form>
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
