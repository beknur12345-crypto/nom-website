import type { Metadata } from 'next';
import { AdminBar } from '@/components/Admin/AdminBar';
import { adminGate } from '@/components/Admin/gate';
import styles from '@/components/Admin/Admin.module.css';
import { DAYS, getVisitStats, type Row } from '@/lib/admin-visits';

export const metadata: Metadata = { title: 'Зочид | Самбар', robots: { index: false, follow: false } };

const nf = new Intl.NumberFormat('en-US');

/** "11.20" from "2026-11-20". */
const shortDay = (d: string) => `${Number(d.slice(5, 7))}.${Number(d.slice(8, 10))}`;

function BarList({ title, rows, unit }: { title: string; rows: Row[]; unit: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className={styles.visitBox} aria-label={title}>
      <h2>{title}</h2>
      {rows.length === 0 ? (
        <p className={styles.visitEmpty}>Мэдээлэл алга</p>
      ) : (
        <ul className={styles.barList}>
          {rows.map((r) => (
            <li key={r.label}>
              <span className={styles.barFill} style={{ width: `${(r.value / max) * 100}%` }} aria-hidden />
              <span className={styles.barLabel}>{r.label}</span>
              <b>
                {nf.format(r.value)}
                <span className="sr-only"> {unit}</span>
              </b>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function VisitsAdmin() {
  const gate = await adminGate();
  if (gate) return gate;
  const stats = await getVisitStats();

  return (
    <div className={styles.admin}>
      <AdminBar active="visits" title="Зочид" refresh />
      <main className={styles.body}>
        {!stats ? (
          <p className={styles.notice}>Өгөгдлийн сан холбогдоогүй байна (DATABASE_URL).</p>
        ) : (
          <>
            <section className={`${styles.stats} ${styles.visitStats}`} aria-label="Тойм">
              <div className={styles.stat}>
                <span>Өнөөдөр</span>
                <b>{nf.format(stats.today.visitors)}</b>
                <small>{nf.format(stats.today.views)} хуудас үзсэн</small>
              </div>
              <div className={styles.stat}>
                <span>Сүүлийн 7 хоног</span>
                <b>{nf.format(stats.week.visitors)}</b>
                <small>{nf.format(stats.week.views)} хуудас үзсэн</small>
              </div>
              <div className={styles.stat}>
                <span>Сүүлийн {DAYS} хоног</span>
                <b>{nf.format(stats.month.visitors)}</b>
                <small>{nf.format(stats.month.views)} хуудас үзсэн</small>
              </div>
              <div className={styles.stat}>
                <span>Захиалга ({DAYS} хоног)</span>
                <b>{nf.format(stats.monthOrders)}</b>
                <small>
                  {stats.month.visitors > 0
                    ? `100 зочин тутмаас ${((stats.monthOrders / stats.month.visitors) * 100).toFixed(1)} захиалга`
                    : '—'}
                </small>
              </div>
            </section>

            <section className={styles.visitBox} aria-label={`Өдөр бүрийн зочид, сүүлийн ${DAYS} хоног`}>
              <h2>Өдөр бүрийн зочид</h2>
              <div className={styles.chart}>
                {stats.daily.map((d) => {
                  const max = Math.max(1, ...stats.daily.map((x) => x.visitors));
                  return (
                    <div
                      key={d.day}
                      className={styles.chartCol}
                      title={`${shortDay(d.day)}: ${d.visitors} зочин, ${d.views} хуудас`}
                    >
                      <span
                        className={styles.chartBar}
                        style={{ height: `${(d.visitors / max) * 100}%` }}
                        data-empty={d.visitors === 0 || undefined}
                      />
                      <span className="sr-only">
                        {shortDay(d.day)}: {d.visitors} зочин
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className={styles.chartAxis} aria-hidden>
                <span>{shortDay(stats.daily[0]!.day)}</span>
                <span>Өнөөдөр</span>
              </div>
            </section>

            <div className={styles.visitGrid}>
              <BarList title="Хаанаас ирсэн" rows={stats.sources} unit="зочин" />
              <BarList title="Үзсэн хуудас" rows={stats.pages} unit="удаа" />
              <BarList title="Улс" rows={stats.countries} unit="зочин" />
              <BarList title="Төхөөрөмж" rows={stats.devices} unit="зочин" />
            </div>

            <p className={styles.visitNote}>
              Нэг хүн нэг өдөр хэд ч орсон 1 зочин гэж тоологдоно. Зочдын нэр, утас, IP хаяг хадгалагдахгүй.
              Хайлтын систем, Facebook-ийн холбоос шалгагч зэрэг роботыг тоолохгүй.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
