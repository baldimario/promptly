import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary
 * @param file File object to upload
 * @returns Promise with upload result
 */
export const uploadToCloudinary = async (file: File) => {
  try {
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Convert buffer to base64
    const base64String = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64String}`;
    
    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: 'promptly', // Set folder name for organization
          resource_type: 'auto', // Automatically determine resource type
          transformation: { quality: 'auto' }, // Optimize quality
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
};
