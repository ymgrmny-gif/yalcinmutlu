import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://yalcinmutlu.pages.dev';
  const lastModified = new Date();

  return [
    { url: `${base}/`, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/projects/`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/privacy/`, lastModified, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
