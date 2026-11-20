'use client';

import { useEffect, useRef, useState } from 'react';
import { submitOrder } from '@/app/actions';
import { site } from '@/content/site';
import { formatMNT } from '@/lib/money';
import { MAX_QTY, MIN_QTY, calculateTotals, isPriceSet } from '@/lib/pricing';
import { PROVINCES } from '@/lib/provinces';
import { ORDER_FIELDS, orderSchema } from '@/lib/schemas';
import { Field } from '@/components/form/Field';
import { Honeypot } from '@/components/form/Honeypot';
import { Share } from '@/components/Share/Share';
import { useForm } from '@/components/form/useForm';
import styles from './OrderForm.module.css';

/** `stock`: books left, or null when stock isn't tracked. */
export function OrderForm({ stock }: { stock: number | null }) {
  const { formRef, result, errors, pending, onSubmit, clearError, reset } = useForm(
    orderSchema,
    ORDER_FIELDS,
    submitOrder,
  );
  const [qty, setQty] = useState(MIN_QTY);
  const maxQty = stock === null ? MAX_QTY : Math.max(MIN_QTY, Math.min(MAX_QTY, stock));
  const doneRef = useRef<HTMLDivElement>(null);

  const totals = calculateTotals(qty);
  const priced = isPriceSet();
  const { bank } = site.payment;
  const pct = site.pricing.depositPercent;

  const done = result.status === 'success';
  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  const startOver = () => {
    reset();
    setQty(MIN_QTY);
  };

  if (stock === 0 && !done) {
    return (
      <div className={styles.done} role="status">
        <h3>Ном дууссан</h3>
        <p>Одоогоор бүх ном зарагдсан байна. Дараагийн хэвлэлт гармагц энд захиалга авч эхэлнэ.</p>
      </div>
    );
  }

  if (done) {
    const live = result.mode === 'live';
    return (
      <div className={styles.done} ref={doneRef} tabIndex={-1} role="status">
        <h3>{live ? 'Захиалга хүлээн авлаа' : 'Туршилтын горим'}</h3>
        <p>
          {live
            ? `Таны захиалгын дугаар ${result.reference ?? ''}. Бид тантай удахгүй холбогдоно.`
            : 'Захиалга илгээгдээгүй. Захиалгын систем холбогдсоны дараа энэ хэсэг ажиллана.'}
        </p>
        {live && (
          <p>
            Захиалгаа баталгаажуулахын тулд{' '}
            {priced ? `${formatMNT(totals.deposit)} (${pct}%)` : `нийт дүнгийн ${pct}%`} урьдчилгааг{' '}
            {bank.bank}, {bank.account} ({bank.holder}) дансанд шилжүүлж, гүйлгээний утгад утасны дугаараа
            бичнэ үү. Үлдэгдлийг номоо хүлээн авахдаа төлнө.
          </p>
        )}
        <button className="btn" type="button" onClick={startOver}>
          Шинэ захиалга
        </button>
        {live && <Share label="Энэ номыг найзууддаа санал болгох" />}
      </div>
    );
  }

  return (
    <form ref={formRef} className={styles.form} onSubmit={onSubmit} noValidate aria-label="Ном захиалах">
      <Honeypot />
      <div className={styles.address}>
        <h3 className={styles.step}>
          <b>1</b>Хаяг
        </h3>
        <div className="field">
          <span className="field__label" id="qty-label">
            Тоо ширхэг
          </span>
          <div className={styles.qty} role="group" aria-labelledby="qty-label">
            <button
              type="button"
              aria-label="Нэгээр хасах"
              disabled={qty <= MIN_QTY}
              onClick={() => setQty((q) => q - 1)}
            >
              −
            </button>
            <output aria-live="polite">{qty}</output>
            <button
              type="button"
              aria-label="Нэгээр нэмэх"
              disabled={qty >= maxQty}
              onClick={() => setQty((q) => q + 1)}
            >
              +
            </button>
          </div>
          <input type="hidden" name="quantity" value={qty} />
          {stock !== null && stock <= 20 && <p className={styles.stockNote}>Зөвхөн {stock} ширхэг үлдсэн</p>}
        </div>
        <Field
          name="name"
          label="Хүлээн авагчийн нэр"
          autoComplete="name"
          placeholder="Нэрээ бичнэ үү"
          required
          error={errors.name}
          onEdit={clearError}
        />
        <Field
          name="phone"
          label="Утасны дугаар"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="0000 0000"
          maxLength={9}
          required
          error={errors.phone}
          onEdit={clearError}
        />
        <div className="row-2">
          <Field
            as="select"
            name="city"
            label="Хот / аймаг"
            defaultValue={PROVINCES[0]}
            error={errors.city}
            onEdit={clearError}
          >
            {PROVINCES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </Field>
          <Field
            name="district"
            label="Дүүрэг / сум"
            placeholder="Дүүрэг, сум"
            required
            error={errors.district}
            onEdit={clearError}
          />
        </div>
        <Field
          name="address"
          label="Дэлгэрэнгүй хаяг"
          autoComplete="street-address"
          placeholder="Хороо, байр, тоот"
          required
          error={errors.address}
          onEdit={clearError}
        />
      </div>

      <div className={styles.payment}>
        <h3 className={styles.step}>
          <b>2</b>Төлбөр
        </h3>
        <input type="hidden" name="pay" value="bank" />
        <div className={styles.panel}>
          <p>
            Захиалга өгөхдөө нийт дүнгийн <b>{pct}%</b>-ийг урьдчилж дараах дансанд шилжүүлнэ. Үлдэгдэл{' '}
            {100 - pct}%-ийг номоо хүлээн авахдаа төлнө.
          </p>
          <dl className={styles.bank}>
            <div>
              <dt>Банк</dt>
              <dd>{bank.bank}</dd>
            </div>
            <div>
              <dt>Данс</dt>
              <dd>{bank.account}</dd>
            </div>
            <div>
              <dt>Хүлээн авагч</dt>
              <dd>{bank.holder}</dd>
            </div>
            <div>
              <dt>Гүйлгээний утга</dt>
              <dd>{bank.reference}</dd>
            </div>
          </dl>
          {!priced && (
            <p className={styles.note}>Үнийн мэдээллийг захиалга хүлээн авмагц утсаар хэлж өгнө.</p>
          )}
        </div>

        {priced && (
          <div className={styles.summary}>
            <div>
              <span>Ном × {totals.quantity}</span>
              <span>{formatMNT(totals.books)}</span>
            </div>
            <div>
              <span>Хүргэлт</span>
              <span>{formatMNT(totals.delivery)}</span>
            </div>
            <div>
              <span>Нийт дүн</span>
              <span>{formatMNT(totals.total)}</span>
            </div>
            <div className={styles.total}>
              <span>Одоо төлөх ({pct}%)</span>
              <span>{formatMNT(totals.deposit)}</span>
            </div>
            <div>
              <span>Хүргэлтээр төлөх</span>
              <span>{formatMNT(totals.balance)}</span>
            </div>
          </div>
        )}

        {result.status === 'error' && (
          <p className={styles.error} role="alert">
            {result.reason === 'out-of-stock'
              ? result.left > 0
                ? `Үлдэгдэл хүрэлцэхгүй байна: одоо ${result.left} ширхэг үлдсэн. Тоо ширхэгээ багасгана уу.`
                : 'Уучлаарай, ном дууссан байна.'
              : result.reason === 'rate-limited'
                ? 'Хэт олон оролдлого хийлээ. Хэдэн минутын дараа дахин оролдоно уу.'
                : `Захиалга илгээгдсэнгүй. Дахин оролдоно уу${site.email ? `, эсвэл ${site.email} хаягаар холбогдоно уу` : ''}.`}
          </p>
        )}
        <button className="btn btn--wide" type="submit" disabled={pending}>
          {pending ? 'Илгээж байна…' : 'Захиалга илгээх'}
        </button>
      </div>
    </form>
  );
}
