/**
 * All editable site content lives here. Replace placeholder values when the
 * real details are ready; the types make sure nothing is left out.
 */

export interface BankDetails {
  bank: string;
  account: string;
  holder: string;
  reference: string;
}

export const site = {
  title: 'Улс төрийн тулаан',
  author: 'Рэнцэнгийн Батсайхан',
  year: 2026,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ulsturiintulaan.com',
  /** Public contact address. Leave null until the mailbox can receive mail (the domain has no MX record yet). */
  email: null as string | null, // e.g. 'info@ulsturiintulaan.com'
  description: 'Улс төр, сонгуулийн технологи, стратеги болон манлайллын иж бүрэн гарын авлага.',
  tagline: 'Улс төр, сонгуулийн технологи, стратеги болон манлайллын иж бүрэн гарын авлага',
  inspiredBy: 'Inspired by the book Vom Kriege',

  /** Limited print run notice, shown under the "Ном захиалах" heading. */
  printRunNote:
    'Энэ гарын авлага ЗӨВХӨН албан хэрэгцээнд зориулагдсан тул цөөн хувиар хэвлэгдсэн. Номын дэлгүүр, номын санд тавигдахгүй болно. 300 хувь хэвлэгдсэн тул урьдчилсан захиалга авч, хүргэлтийн үйлчилгээгээр худалдан авагчид очно.',

  /** Reward notice for reports of illegal copies, shown under printRunNote. */
  piracyReward:
    'Зохиогчийн эрхийг зөрчсөн, энэ гарын авлагыг хувилж олшруулсан талаарх мэдээллийг 1 сая төгрөгөөр үнэлэн худалдаж авна. Нууцлалыг чанд хадгална.',

  pricing: {
    unitPrice: 0, // e.g. 45000
    delivery: 0,
  },

  book: {
    /** "Номын тухай" paragraphs, in order. The Clausewitz portrait sits beside the second one. */
    intro: [
      'Стратегийн харилцааны тулааныг төлөвлөх, өрнүүлэх тухайд хамгийн сайн номыг Харвардын профессор бичээгүй юм. Apple, Adidas, Mercedes, Toyota эсвэл Америкийн Ардчилсан нам, Их Британийн Консерватив намын харилцааны мэргэжилтнүүд ч бичээгүй.',
      'Бүх цаг үеийн хамгийн шилдэг Стратегийн харилцааны сурах бичгийг 1832 онд пруссийн армийн генерал Карл фон Клаузевиц зохиожээ. Номын нэр “Vom Kriege” — “Дайтахуй”. Дайны мөн чанар, стратеги тактикийн арга мэхүүд… бид илүү орчин үеийн, илүү иргэншсэн утгаар ойлгоод хэрэгжүүлчихэд л улс төрд амжилт олно.',
      'Цэргийн сэтгэгч Генерал фон Клаузевиц өөрийгөө дайтах урлагийн тухай ном бичсэн гэж итгэсээр өөд болсон ч номыг нь цэргийнхэн гэхээсээ Стратегийн харилцааны мэргэжилтнүүд гарын авлагаа болгожээ. Бүх хэлбэрийн тулаан, сөргөлдөөнд ялах стратегийн суурь зарчмууд, гүн ухаан, үзэл баримтлалыг шингээсэн ном тул ингэхээс ч аргагүй.',
      '194 жилийн дараа ч Клаузевицын санаа, номлол хүчинтэй хэвээр байна. “Дайтахуй” ном зохиогдсноос хойш зэр зэвсэг, дайн явуулах нөхцөл үндсээрээ өөрчлөгдсөн. Дуунаас хурдан сөнөөгч онгоц, хэт хурдны пуужин, лазерын буу, нисгэгчгүй онгоц, дрон, робот… гээд Клаузевицын мэдэхгүй зэвсгүүдийг ашиглах болсон. Нийтийн тооллоос өмнөх 2500 оноос өнөөг хүртэлх 4525 жилд хүн төрөлхтөн 10624 удаагийн дайн тулаан хийж иржээ. Гэтэл дайныг төлөвлөх, хөтлөх, өрнүүлэх, ялалтад хүргэх зарчимд огтхон ч өөрчлөлт гараагүй өдий хүрчээ.',
    ],
    /** Closing line, shown large. */
    thesis: 'Улс төр, Сонгуулийн технологи, Стратегийн харилцаа нь орчин цагийн дайны хэлбэр юм.',
    pages: null as number | null,
  },

  /** "Хэнд зориулсан бэ?" section. */
  audience: {
    paragraphs: [
      'Монголын улс төрчид “цүнх баригчдын” тогтолцоогоор дамжин суралцаж, өгсөх замдаа улам бүр жижгэрч, мунхарч байгааг таягдан хаяхгүйгээр манай улс төр цэвэршихгүй. Цэвэр улс төр байхгүй бол зохистой хөгжил ирэхгүй.',
      'Цэвэр улс төрд олон зүйл хэрэгтэй ч хамгийн чухал нь шинжлэх ухаанч хандлага, ур чадварыг хослуулсан Стратегийн харилцаа юм. Архагшсан, үжирч догьширсон нам, улс төрчдийг яаж сөрөх, олонхийн дэмжлэгийг хэрхэн татахад суралцах нь шинэ улс төрийн зам байх болно.',
      'Сайн санаа, итгэл, урам зориг байлаа гээд улс төрд амжилт олдоггүйг бидний туулсан 36 жилийн балагт улс төрийн замнал тод харуулсан. Буруу замаар дахин будаа тээх хэрэггүй.',
    ],
    /** The answer to "who is it for", shown emphasised. */
    answer:
      'Улс төрд урт хугацаанд, тогтвортой, амжилттай ажиллахыг зорьж байгаа улс төрчид, тэдний харилцааг хөтлөх хүмүүст л энэ гарын авлагыг зориулав.',
    context:
      'Монголын улс төр бол бүхэлдээ сонирхогчийн түвшний тоглогчдоор дүүрсэн бохир орчин юм. УИХ-ыг сургалтын анги, танхимтай зүйрлэж, гишүүд нэгнээ нэг ангийн жаал, УИХ-ын даргыг ангийн дарга гэж гэхчилэн дуудна. Нэг УИХ-ын гишүүн “ангийнхаа охидыг зодуулаад байж чадахгүй шүү. Бид нар чинь нэг ангийнхан. 4 жилийн бүрэн эрхээ хамт дуусгах ёстой” гэж маанагтсан ч удаатай.',
    quote: {
      text: 'Улс төрд бэлтгэгдсэн боловсон хүчин очдог болохоос тэнд суралцах гэж очдоггүй юм.',
      source: 'Л.Түдэв',
    },
    note: 'Америкт Poli sci-101 буюу улс төрийн анхдагч мэдлэггүй хүн улс төрөөр оролдох нь бүтэхгүй ажил гэх ойлголт бат хэвшсэн байдаг.',
  },

  /** Author bio. First paragraph is the author's own text; the rest is the English text as supplied, labelled as AI-written. */
  authorBio: [
    {
      lang: 'mn',
      text: 'Рэнцэнгийн Батсайхан (1965) улс төр, стратегийн харилцаа, сонгуулийн технологийн чиглэлээр 1996 оноос хойш ажилласан.',
    },
    {
      lang: 'en',
      text: 'AI (ChatGPT): Rentsen Batsaikhan (also known as Nirun Batsaikhan) is a prominent Mongolian film director and a highly influential political communication strategist and media practitioner whose work focuses on public narratives, political branding, strategic messaging, reputation management, and campaign communications.',
    },
    {
      lang: 'en',
      text: 'Drawing on his experience in media production and storytelling, he applies communication strategies to help political leaders, organisations, and public institutions engage audiences, shape public perception, and communicate complex ideas clearly and persuasively.',
    },
  ] as const,

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

export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: '#book', label: 'Номын тухай' },
  { href: '#audience', label: 'Хэнд зориулав' },
  { href: '#author', label: 'Зохиогч' },
  { href: '#articles', label: 'Мэдээ' },
  { href: '#contact', label: 'Холбоо барих' },
];
