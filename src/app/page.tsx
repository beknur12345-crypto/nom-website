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
import { NAV_LINKS, site } from '@/content/site';
import { isEmailConfigured } from '@/lib/email';
import { formatMNT } from '@/lib/money';
import { isPriceSet } from '@/lib/pricing';
import { getStock } from '@/lib/stock';

// Re-check the stock at most once a minute (orders refresh it immediately).
export const revalidate = 60;

export default async function Home() {
  const stock = await getStock();
  // Without email delivery, contact messages would be silently dropped, so hide the form.
  const contactEnabled = isEmailConfigured();
  const links = contactEnabled ? NAV_LINKS : NAV_LINKS.filter((l) => l.href !== '#contact');
  return (
    <>
      <JsonLd />
      <a className="skip-link" href="#main">
        Үндсэн агуулга руу очих
      </a>
      <Header links={links} />
      <main id="main">
        <Hero />
        <About />
        <Audience />
        <Author />
        <OrderSection stock={stock} />
        {contactEnabled && <ContactSection />}
      </main>
      <Footer />
      <MobileOrderBar price={isPriceSet() ? formatMNT(site.pricing.unitPrice) : null} />
    </>
  );
}
