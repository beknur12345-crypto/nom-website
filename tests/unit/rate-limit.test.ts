import { describe, expect, it } from 'vitest';
import { createRateLimiter } from '@/lib/rate-limit';

describe('createRateLimiter', () => {
  it('allows up to the limit within the window, then blocks', () => {
    const allow = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(allow('ip', 0)).toBe(true);
    expect(allow('ip', 100)).toBe(true);
    expect(allow('ip', 200)).toBe(false);
    expect(allow('other', 200)).toBe(true);
  });

  it('allows again after the window passes', () => {
    const allow = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(allow('ip', 0)).toBe(true);
    expect(allow('ip', 999)).toBe(false);
    expect(allow('ip', 1000)).toBe(true);
  });
});
