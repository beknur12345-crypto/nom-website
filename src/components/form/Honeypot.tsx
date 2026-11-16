import { HONEYPOT_FIELD } from '@/lib/schemas';

/** Hidden from people and assistive tech; bots that fill it are ignored by the server. */
export function Honeypot() {
  return (
    <div className="honeypot" aria-hidden="true">
      <label>
        Website
        <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
