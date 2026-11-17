import 'server-only';
import { env } from './env';

export const isTelegramConfigured = () => Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID);

/** Escapes text for Telegram's HTML parse mode. */
export const tgEscape = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Pushes a message to every configured chat. Never throws: a failed
 * notification must not fail the customer's order. Returns true if all sent.
 */
export async function sendTelegram(html: string, button?: { text: string; url: string }): Promise<boolean> {
  if (!isTelegramConfigured()) {
    console.info('[telegram] skipped (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set)');
    return false;
  }
  const chats = env
    .TELEGRAM_CHAT_ID!.split(',')
    .map((c) => c.trim())
    .filter(Boolean);
  const results = await Promise.allSettled(
    chats.map(async (chat_id) => {
      const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chat_id,
          text: html,
          parse_mode: 'HTML',
          link_preview_options: { is_disabled: true },
          // Telegram rejects localhost URLs in buttons, so only add real ones.
          ...(button?.url.startsWith('https://') && {
            reply_markup: { inline_keyboard: [[{ text: button.text, url: button.url }]] },
          }),
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    }),
  );
  const failed = results.filter((r) => r.status === 'rejected');
  for (const f of failed) console.error('[telegram] send failed:', (f as PromiseRejectedResult).reason);
  return failed.length === 0;
}
