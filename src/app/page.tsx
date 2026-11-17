import { About } from '@/components/About/About';
import { Audience } from '@/components/Audience/Audience';
import { Author } from '@/components/Author/Author';
import { ContactSection } from '@/components/ContactForm/ContactSection';
import { Footer } from '@/components/Footer/Footer';
import { Header } from '@/components/Header/Header';
import { Hero } from '@/components/Hero/Hero';
import { JsonLd } from '@/components/JsonLd';
import { MobileOrderBar } from '@/components/MobileOrderBar/MobileOrderBar';
import { OrderSection } from '@/components/OrderForm/OrderSection';
import { site } from '@/content/site';
import { formatMNT } from '@/lib/money';
import { isPriceSet } from '@/lib/pricing';

export default function Home() {
  return (
    <>
      <JsonLd />
      <a className="skip-link" href="#main">
        Үндсэн агуулга руу очих
      </a>
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Audience />
        <Author />
        <OrderSection />
        <ContactSection />
      </main>
      <Footer />
      <MobileOrderBar price={isPriceSet() ? formatMNT(site.pricing.unitPrice) : null} />
    </>
  );
}
