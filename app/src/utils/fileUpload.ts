import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

/**
 * Saves uploaded files to the specified directory
 * @param files - Array of files to save
 * @param directory - Directory to save files to (relative to public folder)
 * @param prefix - Optional prefix to add to filenames (e.g., prompt ID)
 * @returns Promise<string[]> - Array of URLs to access the saved files
 */
export async function saveUploadedFiles(
  files: File[], 
  directory: string = 'uploads/images',
  prefix?: string
): Promise<string[]> {
  // Create full directory path
  const uploadDir = path.join(process.cwd(), 'public', directory);
  
  try {
    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Process each file
    const fileUrls: string[] = [];
    
    for (const file of files) {
      // Generate a unique filename
      const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      // Add prefix if provided
      const filename = prefix 
        ? `${prefix}_${uniqueName}_${safeName}`
        : `${uniqueName}_${safeName}`;
      const filePath = path.join(uploadDir, filename);
      
      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Save file
      await writeFile(filePath, buffer);
      
      // Generate public URL
      const fileUrl = `/${directory}/${filename}`;
      fileUrls.push(fileUrl);
    }
    
    return fileUrls;
  } catch (error) {
    console.error('Error saving uploaded files:', error);
    throw error;
  }
}
