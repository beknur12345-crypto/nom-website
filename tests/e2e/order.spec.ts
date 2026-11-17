import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test('renders the book and has no broken anchors', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Улс төрийн тулаан/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('тулаан');
    for (const id of ['book', 'audience', 'author', 'order']) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
    // Every in-page link must point at a section that exists.
    const hrefs = await page
      .locator('a[href^="#"]')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href')!).filter((h) => h.length > 1));
    for (const href of new Set(hrefs)) {
      await expect(page.locator(href), `anchor ${href}`).toHaveCount(1);
    }
  });
});

test.describe('order form', () => {
  test('shows field errors, keeps typed values, and focuses the first invalid field', async ({ page }) => {
    await page.goto('/#order');
    const form = page.getByRole('form', { name: 'Ном захиалах' });
    await form.getByLabel('Хүлээн авагчийн нэр').fill('Бат');
    await form.getByLabel('Утасны дугаар').fill('123');
    await form.getByRole('button', { name: 'Захиалга илгээх' }).click();

    await expect(form.getByText('8 оронтой дугаар оруулна уу')).toBeVisible();
    await expect(form.getByText('Хаягаа бичнэ үү')).toBeVisible();
    await expect(form.getByLabel('Хүлээн авагчийн нэр')).toHaveValue('Бат');
    await expect(form.getByLabel('Утасны дугаар')).toBeFocused();
  });

  test('submits a valid order in test mode', async ({ page }) => {
    await page.goto('/#order');
    const form = page.getByRole('form', { name: 'Ном захиалах' });
    await form.getByRole('button', { name: 'Нэгээр нэмэх' }).click();
    await expect(form.locator('output')).toHaveText('2');
    await form.getByLabel('Хүлээн авагчийн нэр').fill('Бат');
    await form.getByLabel('Утасны дугаар').fill('9911 2233');
    await form.getByLabel('Хот / аймаг').selectOption('Дархан-Уул');
    await form.getByLabel('Дүүрэг / сум').fill('Дархан сум');
    await form.getByLabel('Дэлгэрэнгүй хаяг').fill('5-р баг, 12 тоот');
    await form.getByText('Дансаар').click();
    // Until a real price and QR are set, payment details are not shown.
    await expect(form.getByText('Төлбөр хийх хэлбэрээ сонгоно уу')).toBeVisible();
    await form.getByRole('button', { name: 'Захиалга илгээх' }).click();

    const status = page.getByRole('status').filter({ hasText: 'Туршилтын горим' });
    await expect(status).toBeVisible();
    await status.getByRole('button', { name: 'Шинэ захиалга' }).click();
    await expect(page.getByRole('form', { name: 'Ном захиалах' })).toBeVisible();
  });
});

test('contact form is hidden while email is not configured', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#contact')).toHaveCount(0);
  await expect(page.locator('a[href="#contact"]')).toHaveCount(0);
});
