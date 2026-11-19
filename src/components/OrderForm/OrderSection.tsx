import Image from 'next/image';
import cover from '@/assets/book.webp';
import { site } from '@/content/site';
import { OrderForm } from './OrderForm';
import styles from './OrderForm.module.css';

export function OrderSection({ stock }: { stock: number | null }) {
  return (
    <section className={styles.order} id="order" aria-labelledby="order-title">
      <div className={styles.intro}>
        <h2 id="order-title">
          Ном <br />
          захиалах
        </h2>
        <p className={styles.printNote}>{site.printRunNote}</p>
        <p className={styles.printNote}>
          <strong>{site.piracyReward}</strong>
        </p>
        <Image className={styles.cover} src={cover} alt="" sizes="372px" />
      </div>
      <OrderForm stock={stock} />
    </section>
  );
}
