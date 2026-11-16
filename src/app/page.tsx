import { About } from '@/components/About/About';
import { AnnouncementBar } from '@/components/AnnouncementBar/AnnouncementBar';
import { Author } from '@/components/Author/Author';
import { Cases } from '@/components/Cases/Cases';
import { ContactSection } from '@/components/ContactForm/ContactSection';
import { Footer } from '@/components/Footer/Footer';
import { Header } from '@/components/Header/Header';
import { Hero } from '@/components/Hero/Hero';
import { JsonLd } from '@/components/JsonLd';
import { MobileOrderBar } from '@/components/MobileOrderBar/MobileOrderBar';
import { OrderSection } from '@/components/OrderForm/OrderSection';
import { PRICE_PLACEHOLDER } from '@/components/Price';
import { Quotes } from '@/components/Quotes/Quotes';
import { Reviews } from '@/components/Reviews/Reviews';
import { site } from '@/content/site';
import { formatMNT } from '@/lib/money';
import { isPriceSet } from '@/lib/pricing';
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      <JsonLd />
      <a className="skip-link" href="#main">
        Үндсэн агуулга руу очих
      </a>
      {site.announcement && <AnnouncementBar message={site.announcement} />}
      <Header />
      <main id="main">
        <Hero />
        <section className={styles.split} aria-label="Номын тухай ба эшлэл">
          <About />
          <Quotes quotes={site.quotes} />
        </section>
        <Cases cases={site.cases} />
        <section className={styles.people} aria-label="Сэтгэгдэл ба зохиогч">
          <Reviews reviews={site.reviews} />
          <Author />
        </section>
        <OrderSection />
        <ContactSection />
      </main>
      <Footer />
      <MobileOrderBar price={isPriceSet() ? formatMNT(site.pricing.unitPrice) : PRICE_PLACEHOLDER} />
    </>
  );
}
