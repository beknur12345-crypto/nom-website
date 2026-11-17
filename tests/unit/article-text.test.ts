import { describe, expect, it } from 'vitest';
import { formatDay, parseBody, safeUrl, slugify, summary } from '@/lib/article-text';

describe('slugify', () => {
  it('transliterates Mongolian Cyrillic into a readable URL', () => {
    expect(slugify('Улс төрийн тулаан 2026!')).toBe('uls-turiin-tulaan-2026');
    expect(slugify('Сонгуулийн технологи: шинэ үе')).toBe('songuuliin-tekhnologi-shine-ue');
  });
  it('falls back when nothing usable is left', () => {
    expect(slugify('!!!')).toBe('niitlel');
  });
});

describe('parseBody', () => {
  it('splits paragraphs on blank lines and reads ## subheadings', () => {
    expect(parseBody('Нэг\nмөр\n\n## Гарчиг\nХоёр')).toEqual([
      { type: 'p', text: 'Нэг мөр' },
      { type: 'h2', text: 'Гарчиг' },
      { type: 'p', text: 'Хоёр' },
    ]);
  });
});

describe('summary', () => {
  it('prefers the excerpt, else trims the first paragraph', () => {
    expect(summary('Товч', 'Урт текст')).toBe('Товч');
    const long = 'үг '.repeat(100);
    expect(summary('', long).length).toBeLessThanOrEqual(180);
    expect(summary('', long).endsWith('…')).toBe(true);
  });
});

it('formats dates and rejects unsafe links', () => {
  expect(formatDay('2026-11-08')).toBe('2026 оны 11-р сарын 8');
  expect(safeUrl('javascript:alert(1)')).toBeNull();
  expect(safeUrl('https://news.mn/a')).toBe('https://news.mn/a');
});
