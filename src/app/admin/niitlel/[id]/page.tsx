import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdminBar } from '@/components/Admin/AdminBar';
import { ArticleEditor } from '@/components/Admin/ArticleEditor';
import { adminGate } from '@/components/Admin/gate';
import styles from '@/components/Admin/Admin.module.css';
import { getArticle } from '@/lib/articles';

export const metadata: Metadata = {
  title: 'Мэдээ засах | Самбар',
  robots: { index: false, follow: false },
};

export default async function EditArticle({ params }: PageProps<'/admin/niitlel/[id]'>) {
  const gate = await adminGate();
  if (gate) return gate;
  const id = Number((await params).id);
  const article = Number.isInteger(id) ? await getArticle(id) : null;
  if (!article) notFound();
  return (
    <div className={styles.admin}>
      <AdminBar active="articles" title="Мэдээ засах" />
      <main className={styles.body}>
        <ArticleEditor article={article} uploadsEnabled={Boolean(process.env.BLOB_READ_WRITE_TOKEN)} />
      </main>
    </div>
  );
}
