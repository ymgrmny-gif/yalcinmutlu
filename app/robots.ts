import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/documents/', '/access/', '/api/', '/transdev-gorusme/'],
      },
    ],
    sitemap: 'https://yalcinmutlu.pages.dev/sitemap.xml',
    host: 'https://yalcinmutlu.pages.dev',
  };
}
