import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://yalcinmutlu.pages.dev';
  const lastModified = new Date('2026-08-12T00:00:00.000Z');

  return [
    { url: `${base}/`, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/projects/`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/privacy/`, lastModified, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
