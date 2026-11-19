import { describe, expect, it } from 'vitest';
import { formatSize, parseMedia } from '@/lib/media';

const host = 'https://abc123.public.blob.vercel-storage.com';
const img = { url: `${host}/medee/photo-x1.jpg`, pathname: 'medee/photo-x1.jpg', width: 1200, height: 800 };
const pdf = {
  url: `${host}/medee/report-x2.pdf`,
  pathname: 'medee/report-x2.pdf',
  name: 'Тайлан',
  size: 2_000_000,
};

describe('parseMedia', () => {
  it('accepts files from our Blob store', () => {
    expect(parseMedia(JSON.stringify([img]), JSON.stringify([pdf]))).toEqual({ images: [img], files: [pdf] });
  });

  it('treats empty fields as no media', () => {
    expect(parseMedia('', '')).toEqual({ images: [], files: [] });
  });

  it('rejects links to other sites', () => {
    expect(
      parseMedia(JSON.stringify([{ ...img, url: 'https://evil.example/medee/x.jpg' }]), '[]'),
    ).toBeNull();
    expect(
      parseMedia(
        JSON.stringify([{ ...img, url: 'http://abc.public.blob.vercel-storage.com/medee/x.jpg' }]),
        '[]',
      ),
    ).toBeNull();
  });

  it('rejects files outside the medee folder, too many files and broken JSON', () => {
    expect(parseMedia('[]', JSON.stringify([{ ...pdf, pathname: 'orders/x.pdf' }]))).toBeNull();
    expect(parseMedia('[]', JSON.stringify(Array(6).fill(pdf)))).toBeNull();
    expect(parseMedia('{oops', '[]')).toBeNull();
  });
});

describe('formatSize', () => {
  it('formats KB and MB', () => {
    expect(formatSize(300)).toBe('1 KB');
    expect(formatSize(2_500_000)).toBe('2.4 MB');
  });
});
