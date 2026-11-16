import { describe, expect, it } from 'vitest';
import { parseRedacted } from '@/components/Quotes/parse';

describe('parseRedacted', () => {
  it('splits bracketed words into redacted segments', () => {
    expect(parseRedacted('a [b] c [d]')).toEqual([
      { text: 'a ', redacted: false },
      { text: 'b', redacted: true },
      { text: ' c ', redacted: false },
      { text: 'd', redacted: true },
    ]);
  });

  it('returns plain text unchanged', () => {
    expect(parseRedacted('no secrets')).toEqual([{ text: 'no secrets', redacted: false }]);
  });
});
