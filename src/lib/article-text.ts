/** Pure helpers for articles (no database), safe to unit test and use anywhere. */

const MN: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  ж: 'j',
  з: 'z',
  и: 'i',
  й: 'i',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  ө: 'u',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ү: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sh',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

/** "Улс төрийн тулаан 2026!" -> "uls-turiin-tulaan-2026" (readable, URL-safe). */
export function slugify(title: string): string {
  const latin = [...title.toLowerCase()].map((ch) => MN[ch] ?? ch).join('');
  const slug = latin
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
  return slug || 'niitlel';
}

export type Block = { type: 'p'; text: string } | { type: 'h2'; text: string };

/** Blank lines separate paragraphs; a line starting with "## " is a subheading. */
export function parseBody(body: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of body.replace(/\r\n/g, '\n').split(/\n\s*\n/)) {
    const lines = chunk.split('\n');
    let para: string[] = [];
    const flush = () => {
      const text = para.join(' ').replace(/\s+/g, ' ').trim();
      if (text) blocks.push({ type: 'p', text });
      para = [];
    };
    for (const line of lines) {
      const m = /^##\s+(.+)/.exec(line.trim());
      if (m) {
        flush();
        blocks.push({ type: 'h2', text: m[1]!.trim() });
      } else para.push(line);
    }
    flush();
  }
  return blocks;
}

/** Excerpt or, failing that, the first ~180 characters of the body. */
export function summary(excerpt: string, body: string): string {
  if (excerpt.trim()) return excerpt.trim();
  const first = parseBody(body).find((b) => b.type === 'p')?.text ?? '';
  return first.length > 180 ? `${first.slice(0, 177).replace(/\s+\S*$/, '')}…` : first;
}

const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

/** "2026-11-18" -> "2026 оны 11-р сарын 18" */
export function formatDay(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${y} оны ${MONTHS[Number(m) - 1]}-р сарын ${Number(d)}`;
}

/** Only http(s) links are allowed as sources. */
export function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null;
  } catch {
    return null;
  }
}
