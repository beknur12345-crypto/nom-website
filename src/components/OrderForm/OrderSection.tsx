import Image from 'next/image';
import cover from '@/assets/book.webp';
import { OrderForm } from './OrderForm';
import styles from './OrderForm.module.css';

export function OrderSection() {
  return (
    <section className={styles.order} id="order" aria-labelledby="order-title">
      <div className={styles.intro}>
        <h2 id="order-title">
          Ном
          <br />
          захиалах
        </h2>
        <Image className={styles.cover} src={cover} alt="" sizes="372px" />
      </div>
      <OrderForm />
    </section>
  );
}
