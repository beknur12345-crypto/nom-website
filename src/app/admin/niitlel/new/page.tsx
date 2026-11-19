import type { Metadata } from 'next';
import { AdminBar } from '@/components/Admin/AdminBar';
import { ArticleEditor } from '@/components/Admin/ArticleEditor';
import { adminGate } from '@/components/Admin/gate';
import styles from '@/components/Admin/Admin.module.css';

export const metadata: Metadata = { title: 'Шинэ мэдээ | Самбар', robots: { index: false, follow: false } };

export default async function NewArticle() {
  const gate = await adminGate();
  if (gate) return gate;
  return (
    <div className={styles.admin}>
      <AdminBar active="articles" title="Шинэ мэдээ" />
      <main className={styles.body}>
        <ArticleEditor />
      </main>
    </div>
  );
}
