'use client';

import { useState } from 'react';
import styles from './OrderForm.module.css';

/**
 * Copies text to the clipboard. Falls back to the older select-and-copy
 * method, which still works in in-app browsers (Facebook, Messenger) and
 * pages where the Clipboard API is blocked.
 */
async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text.length);
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      area.remove();
    }
  }
}

/** A value (like a bank account number) with a one-tap "copy" button beside it. */
export function CopyValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span className={styles.copyValue}>
      <span className={styles.copyText}>{value}</span>
      <button
        type="button"
        className={styles.copyBtn}
        aria-label={`${label} хуулах`}
        onClick={async () => {
          if (await copy(value)) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        }}
      >
        {copied ? 'Хуулсан ✓' : 'Хуулах'}
      </button>
      <span className="sr-only" role="status">
        {copied ? `${label} хуулагдлаа` : ''}
      </span>
    </span>
  );
}
