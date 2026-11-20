import type { Metadata } from 'next';
import { AdminBar } from '@/components/Admin/AdminBar';
import { adminGate } from '@/components/Admin/gate';
import styles from '@/components/Admin/Admin.module.css';
import { DAYS, getVisitStats, type Row } from '@/lib/admin-visits';

export const metadata: Metadata = { title: 'Зочид | Самбар', robots: { index: false, follow: false } };

const nf = new Intl.NumberFormat('en-US');

/** "11 сарын 20" from "2026-11-20". */
const niceDay = (d: string) => `${Number(d.slice(5, 7))} сарын ${Number(d.slice(8, 10))}`;

/** A question with a short ranked list: "Facebook — 12 хүн (60%)". */
function BarList({
  title,
  hint,
  rows,
  unit,
  percent = true,
}: {
  title: string;
  hint: string;
  rows: Row[];
  unit: string;
  percent?: boolean;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((sum, r) => sum + r.value, 0);
  return (
    <section className={styles.visitBox} aria-label={title}>
      <h2>{title}</h2>
      <p className={styles.visitHint}>{hint}</p>
      {rows.length === 0 ? (
        <p className={styles.visitEmpty}>Одоогоор мэдээлэл алга.</p>
      ) : (
        <ul className={styles.barList}>
          {rows.map((r) => (
            <li key={r.label}>
              <span className={styles.barFill} style={{ width: `${(r.value / max) * 100}%` }} aria-hidden />
              <span className={styles.barLabel}>{r.label}</span>
              <b>
                {nf.format(r.value)} {unit}
                {percent && total > 0 && (
                  <span className={styles.barPct}> · {Math.round((r.value / total) * 100)}%</span>
                )}
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

  const busiest = stats?.daily.reduce((a, b) => (b.visitors > a.visitors ? b : a));

  return (
    <div className={styles.admin}>
      <AdminBar active="visits" title="Зочид" refresh />
      <main className={styles.body}>
        {!stats ? (
          <p className={styles.notice}>Өгөгдлийн сан холбогдоогүй байна (DATABASE_URL).</p>
        ) : (
          <>
            <p className={styles.visitIntro}>
              Сайтад хэдэн хүн орсныг, тэд хаанаас ирснийг эндээс харна. Нэг хүн нэг өдөр хэд ч орсон{' '}
              <b>1 хүн</b> гэж тоологдоно.
            </p>

            <section className={`${styles.stats} ${styles.visitStats}`} aria-label="Хэдэн хүн орсон бэ">
              <div className={styles.stat}>
                <span>Өнөөдөр орсон</span>
                <b>{nf.format(stats.today.visitors)} хүн</b>
              </div>
              <div className={styles.stat}>
                <span>Сүүлийн 7 хоногт</span>
                <b>{nf.format(stats.week.visitors)} хүн</b>
              </div>
              <div className={styles.stat}>
                <span>Сүүлийн {DAYS} хоногт</span>
                <b>{nf.format(stats.month.visitors)} хүн</b>
              </div>
              <div className={styles.stat}>
                <span>Сүүлийн {DAYS} хоногт ирсэн захиалга</span>
                <b>{nf.format(stats.monthOrders)}</b>
              </div>
            </section>

            <section
              className={styles.visitBox}
              aria-label={`Өдөр бүр хэдэн хүн орсон, сүүлийн ${DAYS} хоног`}
            >
              <h2>Өдөр бүр хэдэн хүн орсон бэ?</h2>
              <p className={styles.visitHint}>
                Багана бүр нэг өдөр. Өндөр байх тусам олон хүн орсон. Улаан нь өнөөдөр.
              </p>
              <div className={styles.chart}>
                {stats.daily.map((d) => {
                  const max = Math.max(1, busiest?.visitors ?? 0);
                  return (
                    <div
                      key={d.day}
                      className={styles.chartCol}
                      title={`${niceDay(d.day)}: ${d.visitors} хүн`}
                    >
                      <span
                        className={styles.chartBar}
                        style={{ height: `${(d.visitors / max) * 100}%` }}
                        data-empty={d.visitors === 0 || undefined}
                      />
                      <span className="sr-only">
                        {niceDay(d.day)}: {d.visitors} хүн
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className={styles.chartAxis} aria-hidden>
                <span>{niceDay(stats.daily[0]!.day)}</span>
                <span>Өнөөдөр</span>
              </div>
              {busiest && busiest.visitors > 0 && (
                <p className={styles.visitHint}>
                  Хамгийн олон хүн орсон өдөр: <b>{niceDay(busiest.day)}</b>, {nf.format(busiest.visitors)}{' '}
                  хүн.
                </p>
              )}
            </section>

            <div className={styles.visitGrid}>
              <BarList
                title="Хаанаас орж ирсэн бэ?"
                hint={`Сүүлийн ${DAYS} хоногт, хүмүүс ямар холбоосоор дамжиж сайтад орсон.`}
                rows={stats.sources}
                unit="хүн"
              />
              <BarList
                title="Аль хуудсыг үзсэн бэ?"
                hint={`Сүүлийн ${DAYS} хоногт хуудас бүрийг нийт хэдэн удаа нээсэн.`}
                rows={stats.pages}
                unit="удаа"
                percent={false}
              />
              <BarList
                title="Аль улсаас орсон бэ?"
                hint={`Сүүлийн ${DAYS} хоногт.`}
                rows={stats.countries}
                unit="хүн"
              />
              <BarList
                title="Утсаар уу, компьютероор уу?"
                hint={`Сүүлийн ${DAYS} хоногт.`}
                rows={stats.devices}
                unit="хүн"
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
