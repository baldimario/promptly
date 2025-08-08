import fs from 'fs';
import path from 'path';

export class ImageService {
  static listPromptImages(promptId: string): string[] {
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'images');
      if (!fs.existsSync(uploadsDir)) return [];
      const files = fs.readdirSync(uploadsDir);
      return files
        .filter((f) => f.includes(promptId))
        .map((f) => `/uploads/images/${f}`);
    } catch (e) {
      console.error('ImageService.listPromptImages error', e);
      return [];
    }
  }
}
