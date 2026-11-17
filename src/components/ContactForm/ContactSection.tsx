'use client';

import { submitContact } from '@/app/actions';
import { site } from '@/content/site';
import { CONTACT_FIELDS, contactSchema } from '@/lib/schemas';
import { Field } from '@/components/form/Field';
import { Honeypot } from '@/components/form/Honeypot';
import { useForm } from '@/components/form/useForm';
import styles from './ContactSection.module.css';

export function ContactSection() {
  const { formRef, result, errors, pending, onSubmit, clearError, reset } = useForm(
    contactSchema,
    CONTACT_FIELDS,
    submitContact,
  );

  return (
    <section className={styles.contact} id="contact" aria-labelledby="contact-title">
      <h2 id="contact-title">Санал, захидал</h2>
      {site.email && (
        <a className={styles.mail} href={`mailto:${site.email}`}>
          {site.email}
        </a>
      )}

      {result.status === 'success' ? (
        <div className={styles.done} role="status">
          <p>
            {result.mode === 'live'
              ? 'Таны зурвасыг хүлээн авлаа. Баярлалаа!'
              : 'Туршилтын горим: зурвас илгээгдээгүй. И-мэйл холбогдсоны дараа ажиллана.'}
          </p>
          <button className="btn btn--alt" type="button" onClick={reset}>
            Шинэ зурвас
          </button>
        </div>
      ) : (
        <form
          ref={formRef}
          className={styles.form}
          onSubmit={onSubmit}
          noValidate
          aria-label="Санал, захидал"
        >
          <Honeypot />
          <div className="row-2">
            <Field
              name="name"
              label="Таны нэр"
              autoComplete="name"
              placeholder="Нэрээ бичнэ үү"
              required
              error={errors.name}
              onEdit={clearError}
            />
            <Field
              name="email"
              label="И-мэйл хаяг"
              type="email"
              autoComplete="email"
              placeholder="name@mail.mn"
              required
              error={errors.email}
              onEdit={clearError}
            />
          </div>
          <Field
            as="textarea"
            name="message"
            label="Зурвас"
            rows={5}
            placeholder="Санал, захидлаа энд бичнэ үү"
            required
            error={errors.message}
            onEdit={clearError}
          />
          {result.status === 'error' && (
            <p className={styles.error} role="alert">
              {result.reason === 'rate-limited'
                ? 'Хэт олон оролдлого хийлээ. Хэдэн минутын дараа дахин оролдоно уу.'
                : `Зурвас илгээгдсэнгүй. Дахин оролдоно уу${site.email ? `, эсвэл ${site.email} хаягаар шууд бичнэ үү` : ''}.`}
            </p>
          )}
          <button className="btn btn--alt" type="submit" disabled={pending}>
            {pending ? 'Илгээж байна…' : 'Илгээх'}
          </button>
        </form>
      )}
    </section>
  );
}
