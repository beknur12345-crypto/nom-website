import 'server-only';
import { NAV_LINKS, type NavLink } from '@/content/site';
import { isEmailConfigured } from './email';

/** Header links, hiding sections that are not on the page. Off the home page "Нийтлэл" opens /niitlel. */
export function navLinks({ hasArticles, home = true }: { hasArticles: boolean; home?: boolean }): NavLink[] {
  return NAV_LINKS.filter((l) => {
    if (l.href === '#contact') return isEmailConfigured(); // the form would drop messages without email
    if (l.href === '#articles') return hasArticles;
    return true;
  }).map((l) => (!home && l.href === '#articles' ? { ...l, href: '/niitlel' } : l));
}
