import type { MetadataRoute } from 'next';
import { cacheLife } from 'next/cache';
import prisma from '@/lib/prisma';
import { SITE_URL } from '@/lib/seo';

async function getIndexableTypistProfiles(): Promise<
  Array<{ username: string; updatedAt: string }>
> {
  'use cache';
  cacheLife('hours');

  try {
    const users = await prisma.user.findMany({
      where: {
        username: { not: null },
        NOT: { username: '__ghost__' },
        testResults: { some: { isVerified: true } },
      },
      select: {
        username: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 1000,
    });

    return users
      .filter((u): u is { username: string; updatedAt: Date } => Boolean(u.username))
      .map((u) => ({
        username: u.username,
        updatedAt: u.updatedAt.toISOString(),
      }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/leaderboard`,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ];

  const profiles = await getIndexableTypistProfiles();
  const profileRoutes: MetadataRoute.Sitemap = profiles.map((user) => ({
    url: `${SITE_URL}/u/${encodeURIComponent(user.username)}`,
    lastModified: user.updatedAt,
    changeFrequency: 'daily',
    priority: 0.6,
  }));

  return [...staticRoutes, ...profileRoutes];
}
