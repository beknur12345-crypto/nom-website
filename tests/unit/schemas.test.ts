import { describe, expect, it } from 'vitest';
import { contactSchema, fieldErrors, formDataToObject, orderSchema } from '@/lib/schemas';

const validOrder = {
  name: 'Бат',
  phone: '9911 2233',
  city: 'Улаанбаатар',
  district: 'Сүхбаатар дүүрэг',
  address: '1-р хороо, 5-р байр, 12 тоот',
  quantity: '2',
  pay: 'bank',
};

describe('orderSchema', () => {
  it('accepts a valid order and normalises fields', () => {
    const r = orderSchema.parse(validOrder);
    expect(r.phone).toBe('99112233');
    expect(r.quantity).toBe(2);
  });

  it.each([
    ['phone', '1234567', '8 оронтой дугаар оруулна уу'],
    ['phone', 'abcdefgh', '8 оронтой дугаар оруулна уу'],
    ['name', '   ', 'Нэрээ бичнэ үү'],
    ['address', '', 'Хаягаа бичнэ үү'],
    ['city', 'Москва', 'Хот, аймгаа сонгоно уу'],
    ['pay', 'card', 'Төлбөрийн хэлбэрээ сонгоно уу'],
  ])('rejects bad %s (%j) with a Mongolian message', (field, value, message) => {
    const r = orderSchema.safeParse({ ...validOrder, [field]: value });
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error)[field]).toBe(message);
  });

  it('rejects out-of-range quantity and unknown payment method', () => {
    expect(orderSchema.safeParse({ ...validOrder, quantity: '0' }).success).toBe(false);
    expect(orderSchema.safeParse({ ...validOrder, quantity: '100' }).success).toBe(false);
    expect(orderSchema.safeParse({ ...validOrder, pay: 'crypto' }).success).toBe(false);
  });

  it('reports a missing field', () => {
    const { name: _name, ...rest } = validOrder;
    const r = orderSchema.safeParse(rest);
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error).name).toBe('Нэрээ бичнэ үү');
  });
});

describe('contactSchema', () => {
  it('validates email and message', () => {
    expect(
      contactSchema.safeParse({ name: 'Бат', email: 'bat@mail.mn', message: 'Сайн байна уу' }).success,
    ).toBe(true);
    const r = contactSchema.safeParse({ name: 'Бат', email: 'not-an-email', message: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = fieldErrors(r.error);
      expect(e.email).toBe('И-мэйл хаягаа зөв бичнэ үү');
      expect(e.message).toBe('Зурвасаа бичнэ үү');
    }
  });
});

describe('formDataToObject', () => {
  it('keeps only known string fields', () => {
    const fd = new FormData();
    fd.set('name', 'Бат');
    fd.set('isAdmin', 'true');
    fd.set('file', new Blob(['x']));
    expect(formDataToObject(fd, ['name', 'file'])).toEqual({ name: 'Бат' });
  });
});
