/**
 * All editable site content lives here. Replace placeholder values when the
 * real details are ready; the types make sure nothing is left out.
 */

export interface Quote {
  /** Wrap words in [brackets] to show them as blacked-out words readers tap to reveal. */
  text: string;
  source: string;
}

export interface CaseStudy {
  title: string;
  situation: string;
  strategy: string;
  result: string;
}

export interface Review {
  quote: string;
  name: string;
  role: string;
}

export interface BankDetails {
  bank: string;
  account: string;
  holder: string;
  reference: string;
}

const PLACEHOLDER_CASE: CaseStudy = {
  title: 'Кейсийн гарчиг',
  situation: 'Товч тайлбар энд байрлана.',
  strategy: 'Товч тайлбар энд байрлана.',
  result: 'Товч тайлбар энд байрлана.',
};

const PLACEHOLDER_REVIEW: Review = {
  quote: 'Уншигчийн сэтгэгдлээс түүвэрлэсэн хэсэг энд байрлана. Нэг, хоёр өгүүлбэр хангалттай.',
  name: 'Уншигчийн нэр',
  role: 'Албан тушаал',
};

export const site = {
  title: 'Улс төрийн тулаан',
  author: 'Рэнцэнгийн Батсайхан',
  year: 2026,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ulsturiintulaan.com',
  email: 'info@ulsturiintulaan.com',
  description: 'Улс төр, сонгуулийн технологи, стратеги болон манлайллын иж бүрэн гарын авлага.',
  tagline: 'Улс төр, сонгуулийн технологи, стратеги болон манлайллын иж бүрэн гарын авлага',
  inspiredBy: 'Inspired by the book Vom Kriege',

  /** Set to null to hide the announcement bar. */
  announcement: 'Цаг үеийн зар, анхааруулга энд байрлана' as string | null,

  pricing: {
    unitPrice: 0, // e.g. 45000
    delivery: 0,
  },

  book: {
    summary:
      'Номын товч танилцуулга энд байрлана: ном юуны тухай, хэнд зориулсан, уншигч юу олж авах вэ гэдгийг гурав, дөрвөн өгүүлбэрт багтаана.',
    topics: ['Улс төр', 'Сонгуулийн технологи', 'Стратеги', 'Манлайлал'],
    language: 'Монгол',
    pages: null as number | null,
  },

  quotes: [
    {
      text: 'Номоос сонгосон [онцлох] эшлэл энд байрлана. Хоёр, гурван мөрөнд [багтах] богино, хурц [өгүүлбэр] хамгийн сайн уншигдана.',
      source: 'Бүлэг 0, хуудас 000',
    },
    { text: 'Хоёр дахь [эшлэл] энд байрлана. Богино байх [тусам] сайн.', source: 'Бүлэг 0, хуудас 000' },
    { text: 'Гурав дахь [эшлэл] энд байрлана. Богино байх [тусам] сайн.', source: 'Бүлэг 0, хуудас 000' },
  ] satisfies Quote[],

  cases: [PLACEHOLDER_CASE, PLACEHOLDER_CASE, PLACEHOLDER_CASE] satisfies CaseStudy[],

  reviews: [
    PLACEHOLDER_REVIEW,
    PLACEHOLDER_REVIEW,
    PLACEHOLDER_REVIEW,
    PLACEHOLDER_REVIEW,
  ] satisfies Review[],

  authorBio:
    'Зохиогчийн товч намтар энд байрлана: мэргэжлийн туршлага, гол ажлууд, энэ номыг бичих болсон шалтгаан.',

  payment: {
    /** Replace public/qr-sample.svg with the real QR and set isSample to false. */
    qr: { src: '/qr-sample.svg', isSample: true },
    bank: {
      bank: 'Банкны нэр',
      account: '0000 0000 00',
      holder: 'Дансны нэр',
      reference: 'Таны утасны дугаар',
    } satisfies BankDetails,
    cardEnabled: false,
  },
} as const;

export const NAV_LINKS = [
  { href: '#book', label: 'Ном' },
  { href: '#quotes', label: 'Эшлэл' },
  { href: '#cases', label: 'Кейс' },
  { href: '#reviews', label: 'Сэтгэгдэл' },
  { href: '#author', label: 'Зохиогч' },
  { href: '#contact', label: 'Холбоо барих' },
] as const;
