import { saveNote, setStatus } from '@/app/admin/actions';
import type { Order } from '@/db/schema';
import { ORDER_STATUSES, PAY_LABELS, STATUS_LABELS } from '@/lib/labels';
import { formatMNT } from '@/lib/money';
import { CopyButton, Submit } from './ClientBits';
import styles from './Admin.module.css';

const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

/** "11-р сарын 18, 14:32" in Ulaanbaatar time. */
export function formatWhen(d: Date): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ulaanbaatar',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return `${MONTHS[Number(p.month) - 1]}-р сарын ${p.day}, ${p.hour}:${p.minute}`;
}

const prettyPhone = (p: string) => (p.length === 8 ? `${p.slice(0, 4)} ${p.slice(4)}` : p);

export function OrderCard({ order }: { order: Order }) {
  const address = `${order.city}, ${order.district}, ${order.address}`;
  return (
    <article className={styles.card} data-status={order.status} id={`order-${order.id}`}>
      <header className={styles.cardHead}>
        <span className={styles.num}>№{order.id}</span>
        <span className={styles.badge} data-status={order.status}>
          {STATUS_LABELS[order.status]}
        </span>
        <time dateTime={order.createdAt.toISOString()}>{formatWhen(order.createdAt)}</time>
      </header>

      <h3 className={styles.name}>{order.name}</h3>
      <div className={styles.contact}>
        <a className={styles.call} href={`tel:${order.phone}`}>
          Залгах · {prettyPhone(order.phone)}
        </a>
      </div>
      <p className={styles.address}>
        {address} <CopyButton text={`${order.name}, ${order.phone}, ${address}`} />
      </p>

      <dl className={styles.meta}>
        <div>
          <dt>Тоо</dt>
          <dd>{order.quantity} ширхэг</dd>
        </div>
        <div>
          <dt>Төлбөр</dt>
          <dd>{PAY_LABELS[order.payMethod]}</dd>
        </div>
        <div>
          <dt>Нийт</dt>
          <dd>{order.total > 0 ? formatMNT(order.total) : '—'}</dd>
        </div>
      </dl>

      <form action={setStatus} className={styles.statuses} aria-label={`№${order.id} захиалгын төлөв`}>
        <input type="hidden" name="id" value={order.id} />
        {ORDER_STATUSES.map((s) => (
          <Submit
            key={s}
            name="status"
            value={s}
            data-status={s}
            aria-pressed={order.status === s}
            disabled={order.status === s}
          >
            {STATUS_LABELS[s]}
          </Submit>
        ))}
      </form>

      <details className={styles.note} open={Boolean(order.note)}>
        <summary>{order.note ? 'Тэмдэглэл' : 'Тэмдэглэл нэмэх'}</summary>
        <form action={saveNote}>
          <input type="hidden" name="id" value={order.id} />
          <label htmlFor={`note-${order.id}`} className="sr-only">
            Тэмдэглэл
          </label>
          <textarea
            id={`note-${order.id}`}
            name="note"
            className="input"
            rows={2}
            defaultValue={order.note ?? ''}
            placeholder="Жишээ нь: орой 6-аас хойш хүргэх"
          />
          <Submit className="btn btn--sm">Хадгалах</Submit>
        </form>
      </details>
    </article>
  );
}
