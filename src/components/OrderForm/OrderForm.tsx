'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { submitOrder } from '@/app/actions';
import { site } from '@/content/site';
import { PAY_LABELS } from '@/lib/labels';
import { formatMNT } from '@/lib/money';
import { MAX_QTY, MIN_QTY, calculateTotals, isPriceSet } from '@/lib/pricing';
import { PROVINCES } from '@/lib/provinces';
import { ORDER_FIELDS, PAY_METHODS, orderSchema, type PayMethod } from '@/lib/schemas';
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
  const [pay, setPay] = useState<PayMethod>('qr');
  const doneRef = useRef<HTMLDivElement>(null);

  const totals = calculateTotals(qty);
  const priced = isPriceSet();
  /** Payment details are shown only once the price and real QR/bank details are set in content/site.ts. */
  const paymentReady = priced && !site.payment.qr.isSample;

  const done = result.status === 'success';
  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  const startOver = () => {
    reset();
    setQty(MIN_QTY);
    setPay('qr');
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
        <fieldset className={styles.tabs}>
          <legend className="sr-only">Төлбөрийн хэлбэр</legend>
          {PAY_METHODS.map((m) => (
            <label key={m}>
              <input type="radio" name="pay" value={m} checked={pay === m} onChange={() => setPay(m)} />
              <span>{PAY_LABELS[m]}</span>
            </label>
          ))}
        </fieldset>

        <div className={paymentReady ? styles.panel : styles.pending}>
          {!paymentReady && (
            <p>
              Төлбөр хийх хэлбэрээ сонгоно уу. Захиалгыг тань хүлээн авмагц бид утсаар холбогдож үнэ,
              төлбөрийн мэдээллийг хүргэнэ.
            </p>
          )}
          {paymentReady && pay === 'qr' && (
            <>
              <div className={styles.qr}>
                <Image
                  src={site.payment.qr.src}
                  width={200}
                  height={200}
                  alt={site.payment.qr.isSample ? 'Жишээ QR код' : 'Төлбөрийн QR код'}
                  unoptimized
                />
              </div>
              {site.payment.qr.isSample && (
                <small className={styles.sample}>Жишээ код. Төлбөр авахгүй.</small>
              )}
              <p>Банкны аппликейшнээр уншуулна уу</p>
            </>
          )}
          {paymentReady && pay === 'bank' && (
            <dl className={styles.bank}>
              <div>
                <dt>Банк</dt>
                <dd>{site.payment.bank.bank}</dd>
              </div>
              <div>
                <dt>Данс</dt>
                <dd>{site.payment.bank.account}</dd>
              </div>
              <div>
                <dt>Хүлээн авагч</dt>
                <dd>{site.payment.bank.holder}</dd>
              </div>
              <div>
                <dt>Гүйлгээний утга</dt>
                <dd>{site.payment.bank.reference}</dd>
              </div>
            </dl>
          )}
          {paymentReady && pay === 'card' && (
            <p className={styles.note}>Картын төлбөрийн холболт хийгдсэний дараа энэ хэсэг идэвхжинэ.</p>
          )}
        </div>

        {paymentReady && (
          <div className={styles.summary}>
            <div>
              <span>Ном × {totals.quantity}</span>
              <span>{formatMNT(totals.books)}</span>
            </div>
            <div>
              <span>Хүргэлт</span>
              <span>{formatMNT(totals.delivery)}</span>
            </div>
            <div className={styles.total}>
              <span>Нийт дүн</span>
              <span>{formatMNT(totals.total)}</span>
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
