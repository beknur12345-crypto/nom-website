import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeContent: 'center',
        gap: 24,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: 'clamp(48px, 10vw, 120px)', color: 'var(--red)' }}>404</h1>
      <p>Хуудас олдсонгүй.</p>
      <p>
        <Link className="btn" href="/">
          Нүүр хуудас
        </Link>
      </p>
    </main>
  );
}
