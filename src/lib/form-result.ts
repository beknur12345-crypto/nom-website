import type { FieldErrors } from './schemas';

export type FormResult =
  | { status: 'idle' }
  | { status: 'invalid'; errors: FieldErrors }
  | { status: 'success'; mode: 'live' | 'test'; reference?: string }
  | { status: 'error'; reason: 'server' | 'rate-limited' }
  | { status: 'error'; reason: 'out-of-stock'; left: number };

export const IDLE: FormResult = { status: 'idle' };
