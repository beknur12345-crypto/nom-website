import { notFound } from 'next/navigation';
import { site } from '@/content/site';
import { isAdminConfigured, isSignedIn } from '@/lib/admin-auth';
import { LoginForm } from './ClientBits';
import styles from './Admin.module.css';

/** Returns the login screen when not signed in, or null to continue. 404 when admin is disabled. */
export async function adminGate() {
  if (!isAdminConfigured()) notFound();
  if (await isSignedIn()) return null;
  return (
    <div className={styles.admin}>
      <div className={styles.login}>
        <p className={styles.brand}>{site.title}</p>
        <h1>Захиалгын самбар</h1>
        <LoginForm />
      </div>
    </div>
  );
}
