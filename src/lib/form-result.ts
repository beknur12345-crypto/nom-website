import type { FieldErrors } from './schemas';

export type FormResult =
  | { status: 'idle' }
  | { status: 'invalid'; errors: FieldErrors }
  | { status: 'success'; mode: 'live' | 'test'; reference?: string }
  | { status: 'error'; reason: 'server' | 'rate-limited' };

export const IDLE: FormResult = { status: 'idle' };
