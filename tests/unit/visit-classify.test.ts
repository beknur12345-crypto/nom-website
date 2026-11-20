import { describe, expect, it } from 'vitest';
import { cleanPath, deviceOf, isBot, sourceOf, ubDay } from '@/lib/visit-classify';

const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/450.0]';
const ANDROID_PHONE =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36';
const ANDROID_TABLET = 'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 Chrome/130 Safari/537.36';
const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/130 Safari/537.36';

const site = { siteHost: 'www.ulsturiintulaan.com' };

describe('sourceOf', () => {
  it('recognises Facebook by referrer or by the fbclid it adds to links', () => {
    expect(sourceOf({ ...site, referrer: 'https://l.facebook.com/', query: '' })).toBe('facebook');
    expect(sourceOf({ ...site, referrer: 'https://m.facebook.com/story', query: '' })).toBe('facebook');
    expect(sourceOf({ ...site, referrer: '', query: '?fbclid=IwAR123' })).toBe('facebook');
  });

  it('names well-known sites and keeps other hosts', () => {
    expect(sourceOf({ ...site, referrer: 'https://www.google.mn/', query: '' })).toBe('google');
    expect(sourceOf({ ...site, referrer: 'https://t.me/', query: '' })).toBe('telegram');
    expect(sourceOf({ ...site, referrer: 'https://www.news.mn/a/1', query: '' })).toBe('news.mn');
  });

  it('treats no referrer, or the site itself, as direct', () => {
    expect(sourceOf({ ...site, referrer: '', query: '' })).toBe('direct');
    expect(sourceOf({ ...site, referrer: 'https://ulsturiintulaan.com/niitlel', query: '' })).toBe('direct');
  });

  it('falls back to utm_source', () => {
    expect(sourceOf({ ...site, referrer: '', query: '?utm_source=instagram' })).toBe('instagram');
    expect(sourceOf({ ...site, referrer: '', query: '?utm_source=Poster' })).toBe('poster');
  });
});

describe('deviceOf', () => {
  it('tells phones, tablets and computers apart', () => {
    expect(deviceOf(IPHONE)).toBe('mobile');
    expect(deviceOf(ANDROID_PHONE)).toBe('mobile');
    expect(deviceOf(ANDROID_TABLET)).toBe('tablet');
    expect(deviceOf(MAC)).toBe('desktop');
  });
});

describe('isBot', () => {
  it('skips crawlers and link previews but not people', () => {
    expect(isBot('facebookexternalhit/1.1')).toBe(true);
    expect(isBot('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true);
    expect(isBot('TelegramBot (like TwitterBot)')).toBe(true);
    expect(isBot('')).toBe(true);
    expect(isBot(IPHONE)).toBe(false);
  });
});

describe('cleanPath', () => {
  it('keeps the path only and ignores admin and invalid paths', () => {
    expect(cleanPath('/niitlel/abc?phone=99112233#x')).toBe('/niitlel/abc');
    expect(cleanPath('/admin')).toBeNull();
    expect(cleanPath('/api/visit')).toBeNull();
    expect(cleanPath('https://evil.com')).toBeNull();
    expect(cleanPath('//evil.com')).toBeNull();
  });
});

describe('ubDay', () => {
  it('uses Ulaanbaatar time (UTC+8)', () => {
    expect(ubDay(new Date('2026-11-20T17:30:00Z'))).toBe('2026-11-21');
    expect(ubDay(new Date('2026-11-20T15:30:00Z'))).toBe('2026-11-20');
  });
});
