'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { saveArticle, type ArticleState } from '@/app/admin/article-actions';
import type { Article } from '@/db/schema';
import { Submit } from './ClientBits';
import styles from './Admin.module.css';

const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ulaanbaatar' });

export function ArticleEditor({ article }: { article?: Article }) {
  const [state, action] = useActionState<ArticleState, FormData>(saveArticle, {});
  const e = state.errors ?? {};
  const err = (k: keyof typeof e) =>
    e[k] ? (
      <p className="field__error" id={`${k}-error`} role="alert">
        {e[k]}
      </p>
    ) : null;
  const a11y = (k: keyof typeof e) =>
    e[k] ? { 'aria-invalid': true, 'aria-describedby': `${k}-error` } : {};

  return (
    <form action={action} className={styles.editor} noValidate>
      {article && <input type="hidden" name="id" value={article.id} />}
      {err('form')}

      <label className="field">
        <span className="field__label">Гарчиг</span>
        <input
          className="input"
          name="title"
          defaultValue={article?.title}
          required
          maxLength={200}
          {...a11y('title')}
        />
        {err('title')}
      </label>

      <div className={styles.editorRow}>
        <label className="field">
          <span className="field__label">Огноо</span>
          <input
            className="input"
            type="date"
            name="publishedOn"
            defaultValue={article?.publishedOn ?? today()}
            required
            {...a11y('publishedOn')}
          />
          {err('publishedOn')}
        </label>
        <label className="field">
          <span className="field__label">Эх сурвалж (заавал биш)</span>
          <input
            className="input"
            name="sourceName"
            defaultValue={article?.sourceName ?? ''}
            placeholder="Жишээ нь: Өдрийн сонин"
          />
        </label>
      </div>

      <label className="field">
        <span className="field__label">Эх сурвалжийн холбоос (заавал биш)</span>
        <input
          className="input"
          type="url"
          name="sourceUrl"
          inputMode="url"
          defaultValue={article?.sourceUrl ?? ''}
          placeholder="https://"
          {...a11y('sourceUrl')}
        />
        {err('sourceUrl')}
      </label>

      <label className="field">
        <span className="field__label">Товч агуулга</span>
        <textarea
          className="input"
          name="excerpt"
          rows={2}
          maxLength={400}
          defaultValue={article?.excerpt}
          placeholder="Жагсаалтад харагдах 1–2 өгүүлбэр. Хоосон орхивол эхний догол мөрийг ашиглана."
        />
      </label>

      <label className="field">
        <span className="field__label">Нийтлэлийн текст</span>
        <textarea className="input" name="body" rows={16} defaultValue={article?.body} {...a11y('body')} />
        <span className={styles.hint}>
          Догол мөрийн хооронд хоосон мөр үлдээнэ. Дэд гарчиг бол мөрийн эхэнд <code>## </code> бичнэ. Өөр
          сайтад гарсан нийтлэл бол текстгүйгээр зөвхөн холбоосыг нь оруулж болно.
        </span>
        {err('body')}
      </label>

      <div className={styles.editorActions}>
        <Submit className="btn" name="intent" value="publish">
          {article?.isPublished ? 'Хадгалах' : 'Нийтлэх'}
        </Submit>
        {!article?.isPublished && (
          <Submit className="btn btn--alt" name="intent" value="draft">
            Ноорог болгон хадгалах
          </Submit>
        )}
        <Link className={styles.clear} href="/admin/niitlel">
          Болих
        </Link>
      </div>
    </form>
  );
}
