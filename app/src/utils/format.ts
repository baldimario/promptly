// Reusable formatting helpers
export function avatarUrl(name?: string | null, image?: string | null) {
  if (image) return image;
  const fallbackName = encodeURIComponent(name || 'Unknown');
  return `https://ui-avatars.com/api/?name=${fallbackName}&background=random`;
}

export function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw as string);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function averageRating(ratings: { rating: number }[] | null | undefined): number {
  if (!ratings || ratings.length === 0) return 0;
  const total = ratings.reduce((sum, r) => sum + (r?.rating || 0), 0);
  return total / ratings.length;
}

export function iso(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  try {
    return (d instanceof Date ? d : new Date(d)).toISOString();
  } catch {
    return null;
  }
}
