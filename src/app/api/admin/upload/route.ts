import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { isSignedIn } from '@/lib/admin-auth';
import { MEDIA, MEDIA_PREFIX } from '@/lib/media';

/**
 * Issues short-lived upload tokens so the admin's browser uploads photos and PDFs
 * straight to Vercel Blob (large PDFs never pass through this function).
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'File storage is not set up' }, { status: 503 });
  }
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await isSignedIn())) throw new Error('Unauthorized');
        if (!pathname.startsWith(MEDIA_PREFIX)) throw new Error('Bad path');
        const isPdf = pathname.toLowerCase().endsWith('.pdf');
        const rule = isPdf ? MEDIA.pdf : MEDIA.image;
        return {
          allowedContentTypes: [...rule.types],
          maximumSizeInBytes: rule.maxBytes,
          addRandomSuffix: true,
        };
      },
      // Nothing to record here: the editor saves the returned URLs with the article.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 400 });
  }
}
