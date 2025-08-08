import { describe, it, expect } from 'vitest';
import { getPromptImageUrl } from '@/utils/placeholderImage';

describe('getPromptImageUrl', () => {
  it('returns provided relative image path as-is', () => {
    const url = getPromptImageUrl({ title: 'T', image: '/uploads/images/abc.png', userName: 'U', tags: [] });
    expect(url).toBe('/uploads/images/abc.png');
  });

  it('returns external image as-is', () => {
    const url = getPromptImageUrl({ title: 'T', image: 'https://example.com/x.png', userName: 'U', tags: [] });
    expect(url).toBe('https://example.com/x.png');
  });

  it('generates ui-avatars placeholder when image empty', () => {
    const url = getPromptImageUrl({ title: 'Lorem Ipsum', image: '', userName: 'User', tags: ['ai'] });
    expect(url.startsWith('https://ui-avatars.com/api/?name=')).toBe(true);
  });
});
