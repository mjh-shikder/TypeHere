import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const GOOGLE_AVATAR_HOST = /^lh\d+\.googleusercontent\.com$/;
const ALLOWED_IMAGE_TYPE = /^image\/(?:png|jpeg|webp|gif|avif)$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { image: true },
  });

  if (!user?.image) {
    return new NextResponse(null, { status: 404 });
  }

  let imageUrl: URL;
  try {
    imageUrl = new URL(user.image);
  } catch {
    return new NextResponse(null, { status: 404 });
  }

  if (imageUrl.protocol !== 'https:' || !GOOGLE_AVATAR_HOST.test(imageUrl.hostname)) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const imageResponse = await fetch(imageUrl, {
      redirect: 'error',
      signal: AbortSignal.timeout(5000),
    });
    const contentType = imageResponse.headers.get('content-type')?.split(';')[0] ?? '';
    const contentLength = Number(imageResponse.headers.get('content-length') ?? 0);

    if (
      !imageResponse.ok ||
      !ALLOWED_IMAGE_TYPE.test(contentType) ||
      contentLength > MAX_AVATAR_BYTES
    ) {
      return new NextResponse(null, { status: 502 });
    }

    const image = await imageResponse.arrayBuffer();
    if (image.byteLength > MAX_AVATAR_BYTES) {
      return new NextResponse(null, { status: 502 });
    }

    return new NextResponse(image, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Failed to load Google profile image:', error);
    return new NextResponse(null, { status: 502 });
  }
}
