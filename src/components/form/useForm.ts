'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import type * as z from 'zod/mini';
import { IDLE, type FormResult } from '@/lib/form-result';
import { fieldErrors, formDataToObject, type FieldErrors } from '@/lib/schemas';

/**
 * Validates on the client with the same zod schema the server uses, then
 * calls the server action. Uses onSubmit (not <form action>) so React does not
 * reset the fields when validation fails.
 */
export function useForm(
  schema: z.ZodMiniType,
  fields: readonly string[],
  action: (formData: FormData) => Promise<FormResult>,
) {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<FormResult>(IDLE);
  const [pending, startTransition] = useTransition();

  const errors: FieldErrors = result.status === 'invalid' ? result.errors : {};

  useEffect(() => {
    if (result.status === 'invalid') {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [result]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = schema.safeParse(formDataToObject(formData, fields));
    if (!parsed.success) {
      setResult({ status: 'invalid', errors: fieldErrors(parsed.error) });
      return;
    }
    startTransition(async () => {
      try {
        setResult(await action(formData));
      } catch {
        setResult({ status: 'error', reason: 'server' });
      }
    });
  };

  /** Clears one field's error as soon as the user edits it. */
  const clearError = useCallback((name: string) => {
    setResult((r) => {
      if (r.status !== 'invalid' || !r.errors[name]) return r;
      const rest = { ...r.errors };
      delete rest[name];
      return { status: 'invalid', errors: rest };
    });
  }, []);

  const reset = () => {
    formRef.current?.reset();
    setResult(IDLE);
  };

  return { formRef, result, errors, pending, onSubmit, clearError, reset };
}
