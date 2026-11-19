'use client';

import { upload } from '@vercel/blob/client';
import { useId, useRef, useState } from 'react';
import type { ArticleFile, ArticleImage } from '@/db/schema';
import { MEDIA, MEDIA_PREFIX, formatSize, type MediaKind } from '@/lib/media';
import styles from './Admin.module.css';

type Pending = { key: string; name: string; percent: number };

/** Storage path: Mongolian letters and spaces are dropped; Blob adds a random suffix. */
function blobPath(file: File, kind: MediaKind): string {
  const ext = kind === 'pdf' ? 'pdf' : (file.type.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg');
  const base =
    file.name
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || (kind === 'pdf' ? 'file' : 'photo');
  return `${MEDIA_PREFIX}${base}.${ext}`;
}

async function imageSize(file: File): Promise<{ width: number; height: number }> {
  const bmp = await createImageBitmap(file);
  const size = { width: bmp.width, height: bmp.height };
  bmp.close();
  return size;
}

/**
 * Photos and PDFs for one article. Files upload from the browser straight to Vercel Blob;
 * the resulting list is sent with the form as two hidden JSON fields.
 */
export function MediaPicker({
  initialImages,
  initialFiles,
  enabled,
  error,
  onBusyChange,
}: {
  initialImages: ArticleImage[];
  initialFiles: ArticleFile[];
  enabled: boolean;
  error?: string;
  onBusyChange: (busy: boolean) => void;
}) {
  const [images, setImages] = useState(initialImages);
  const [files, setFiles] = useState(initialFiles);
  const [pending, setPending] = useState<Pending[]>([]);
  const [problems, setProblems] = useState<string[]>([]);
  const busy = useRef(0);
  const ids = { img: useId(), pdf: useId() };

  const track = (delta: number) => {
    busy.current += delta;
    onBusyChange(busy.current > 0);
  };

  async function add(list: FileList | null, kind: MediaKind) {
    if (!list?.length) return;
    const rule = MEDIA[kind];
    const have = kind === 'image' ? images.length : files.length;
    const chosen = Array.from(list);
    const errs: string[] = [];
    const ok = chosen.filter((f) => {
      if (!(rule.types as readonly string[]).includes(f.type)) {
        errs.push(
          `${f.name}: ${kind === 'pdf' ? 'зөвхөн PDF файл' : 'зөвхөн JPG, PNG, WebP зураг'} оруулна уу.`,
        );
        return false;
      }
      if (f.size > rule.maxBytes) {
        errs.push(`${f.name}: ${formatSize(rule.maxBytes)}-аас ихгүй байх ёстой.`);
        return false;
      }
      return true;
    });
    const room = rule.max - have;
    if (ok.length > room) {
      errs.push(`Нэг мэдээнд ${kind === 'pdf' ? 'PDF' : 'зураг'} хамгийн ихдээ ${rule.max} байна.`);
      ok.splice(Math.max(room, 0));
    }
    setProblems(errs);

    await Promise.all(
      ok.map(async (file) => {
        const key = `${file.name}-${file.size}-${Math.random()}`;
        setPending((p) => [...p, { key, name: file.name, percent: 0 }]);
        track(1);
        try {
          const size = kind === 'image' ? await imageSize(file) : null;
          const blob = await upload(blobPath(file, kind), file, {
            access: 'public',
            handleUploadUrl: '/api/admin/upload',
            contentType: file.type,
            multipart: file.size > 5 * 1024 * 1024,
            onUploadProgress: ({ percentage }) =>
              setPending((p) =>
                p.map((x) => (x.key === key ? { ...x, percent: Math.round(percentage) } : x)),
              ),
          });
          if (size) setImages((l) => [...l, { url: blob.url, pathname: blob.pathname, ...size }]);
          else
            setFiles((l) => [
              ...l,
              {
                url: blob.url,
                pathname: blob.pathname,
                name: file.name.replace(/\.pdf$/i, ''),
                size: file.size,
              },
            ]);
        } catch (err) {
          console.error(err);
          setProblems((e) => [...e, `${file.name}: хуулж чадсангүй. Интернэтээ шалгаад дахин оролдоно уу.`]);
        } finally {
          setPending((p) => p.filter((x) => x.key !== key));
          track(-1);
        }
      }),
    );
  }

  const makeCover = (i: number) => setImages((l) => [l[i]!, ...l.filter((_, j) => j !== i)]);

  return (
    <fieldset className={styles.media}>
      <legend className="field__label">Зураг ба PDF файл (заавал биш)</legend>
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="files" value={JSON.stringify(files)} />

      {!enabled && (
        <p className={styles.hint}>
          Файл хадгалах сан (Vercel Blob) холбогдоогүй байгаа тул одоогоор зураг, PDF оруулах боломжгүй.
        </p>
      )}

      {images.length > 0 && (
        <ul className={styles.thumbs}>
          {images.map((img, i) => (
            <li key={img.url} className={styles.thumb}>
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of a just-uploaded file */}
              <img src={img.url} alt="" width={img.width} height={img.height} />
              {i === 0 ? (
                <span className={styles.coverTag}>Нүүр зураг</span>
              ) : (
                <button type="button" className={styles.linkBtn} onClick={() => makeCover(i)}>
                  Нүүр зураг болгох
                </button>
              )}
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => setImages((l) => l.filter((x) => x.url !== img.url))}
              >
                Хасах
              </button>
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul className={styles.pdfList}>
          {files.map((f, i) => (
            <li key={f.url}>
              <span className={styles.pdfBadge}>PDF</span>
              <label className={styles.pdfName}>
                <span className="sr-only">Файлын нэр</span>
                <input
                  className="input"
                  value={f.name}
                  maxLength={160}
                  onChange={(e) =>
                    setFiles((l) => l.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                  }
                />
              </label>
              <span className={styles.pdfSize}>{formatSize(f.size)}</span>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => setFiles((l) => l.filter((x) => x.url !== f.url))}
              >
                Хасах
              </button>
            </li>
          ))}
        </ul>
      )}

      {pending.length > 0 && (
        <ul className={styles.uploads} aria-live="polite">
          {pending.map((p) => (
            <li key={p.key}>
              <span>{p.name}</span>
              <progress max={100} value={p.percent} aria-label={`${p.name} хуулж байна`} />
              <span>{p.percent}%</span>
            </li>
          ))}
        </ul>
      )}

      {enabled && (
        <div className={styles.mediaButtons}>
          <input
            id={ids.img}
            className="sr-only"
            type="file"
            accept={MEDIA.image.types.join(',')}
            multiple
            onChange={(e) => {
              void add(e.target.files, 'image');
              e.target.value = '';
            }}
          />
          <label className="btn btn--alt" htmlFor={ids.img}>
            + Зураг нэмэх
          </label>
          <input
            id={ids.pdf}
            className="sr-only"
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => {
              void add(e.target.files, 'pdf');
              e.target.value = '';
            }}
          />
          <label className="btn btn--alt" htmlFor={ids.pdf}>
            + PDF нэмэх
          </label>
        </div>
      )}
      {enabled && (
        <span className={styles.hint}>
          Зураг: JPG, PNG, WebP, тус бүр {formatSize(MEDIA.image.maxBytes)} хүртэл. Эхний зураг нүүр зураг
          болж жагсаалт болон Facebook-т харагдана. PDF: тус бүр {formatSize(MEDIA.pdf.maxBytes)} хүртэл,{' '}
          {MEDIA.pdf.max} хүртэл файл.
        </span>
      )}

      {[...problems, ...(error ? [error] : [])].map((p) => (
        <p key={p} className="field__error" role="alert">
          {p}
        </p>
      ))}
    </fieldset>
  );
}
