'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  login,
  sendTestNotification,
  updateStock,
  type LoginState,
  type StockState,
} from '@/app/admin/actions';
import styles from './Admin.module.css';

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className={styles.loginForm}>
      <label className="field">
        <span className="field__label">Нууц үг</span>
        <input
          className="input"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? 'login-error' : undefined}
        />
      </label>
      {state.error && (
        <p id="login-error" className="field__error" role="alert">
          {state.error}
        </p>
      )}
      <button className="btn btn--wide" type="submit" disabled={pending}>
        {pending ? 'Шалгаж байна…' : 'Нэвтрэх'}
      </button>
    </form>
  );
}

/** Submit button that shows progress while its form's server action runs. */
export function Submit({ children, className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  return (
    <button
      {...rest}
      className={className}
      type="submit"
      disabled={pending || rest.disabled}
      aria-busy={pending}
    >
      {children}
    </button>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={styles.copy}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* clipboard blocked: nothing to do */
        }
      }}
    >
      {copied ? 'Хуулсан ✓' : 'Хаяг хуулах'}
    </button>
  );
}

/** Re-fetches the dashboard every 30 s while it is on screen, so new orders appear on their own. */
export function AutoRefresh() {
  const router = useRouter();
  const [at, setAt] = useState<string>('');
  useEffect(() => {
    const stamp = () => setAt(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    stamp();
    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      router.refresh();
      stamp();
    };
    const id = setInterval(tick, 30_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [router]);
  return <span className={styles.refreshed}>{at && `Шинэчлэгдсэн ${at}`}</span>;
}

export function StockForm({ stock }: { stock: number }) {
  const [state, action] = useActionState<StockState, FormData>(updateStock, {});
  return (
    <form action={action} className={styles.stockForm}>
      <label htmlFor="stock-input" className="sr-only">
        Үлдэгдэл засах
      </label>
      <input
        id="stock-input"
        className="input"
        type="number"
        name="stock"
        min={0}
        inputMode="numeric"
        defaultValue={stock}
        key={stock}
      />
      <Submit className="btn btn--sm">Хадгалах</Submit>
      {state.error && (
        <p className="field__error" role="alert">
          {state.error}
        </p>
      )}
      {state.saved && <p className={styles.saved}>Хадгаллаа ✓</p>}
    </form>
  );
}

export function TestNotification() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<boolean | null>(null);
  return (
    <span className={styles.testNotify}>
      <button
        type="button"
        className={styles.linkButton}
        disabled={pending}
        onClick={() => start(async () => setResult((await sendTestNotification()).ok))}
      >
        {pending ? 'Илгээж байна…' : 'Туршилтын мэдэгдэл илгээх'}
      </button>
      {result !== null && (
        <span role="status">{result ? 'Илгээлээ ✓ Утсаа шалгана уу' : 'Илгээж чадсангүй'}</span>
      )}
    </span>
  );
}

/** Submit button that asks for confirmation first (for destructive actions). */
export function ConfirmSubmit({ message, children }: { message: string; children: React.ReactNode }) {
  return (
    <Submit
      className={styles.danger}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </Submit>
  );
}
