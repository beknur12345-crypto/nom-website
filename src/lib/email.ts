import 'server-only';
import { Resend } from 'resend';
import { env } from './env';

let client: Resend | undefined;

export const isEmailConfigured = () => Boolean(env.RESEND_API_KEY && env.ORDER_NOTIFY_EMAIL);

interface Mail {
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

/** Sends a notification to the site owner. Returns false instead of throwing. */
export async function notifyOwner(mail: Mail): Promise<boolean> {
  if (!env.RESEND_API_KEY || !env.ORDER_NOTIFY_EMAIL) {
    console.info('[email] skipped (RESEND_API_KEY / ORDER_NOTIFY_EMAIL not set):', mail.subject);
    return false;
  }
  client ??= new Resend(env.RESEND_API_KEY);
  const { error } = await client.emails.send({
    from: env.EMAIL_FROM,
    to: env.ORDER_NOTIFY_EMAIL,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    replyTo: mail.replyTo,
  });
  if (error) {
    console.error('[email] send failed:', error);
    return false;
  }
  return true;
}
