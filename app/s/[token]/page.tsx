// app/s/[token]/page.tsx — v1.1 (Jun 2026)
// Public shared memory page.
//
// v1.0 → v1.1:
// • CTA now says “Open Memory Temple”.
// • Android opens the app via intent link when installed.
// • Android falls back to the Play Store when not installed.
// • Desktop/iOS fall back to Illimitable AI for now.

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

type SharedAsset = {
  id: string;
  kind: 'photo' | 'video';
  url: string | null;
  thumbUrl: string | null;
  mime: string | null;
  width: number | null;
  height: number | null;
};

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=ai.illimitable.memorytemple';

const FALLBACK_URL = 'https://illimitableai.com';

async function getSharedMemory(token: string) {
  const res = await fetch(
    `https://wuiqgeqxgsalnuzfaekz.supabase.co/functions/v1/public-memory-share?token=${encodeURIComponent(token)}`,
    { cache: 'no-store' },
  );

  if (!res.ok) return null;
  return res.json();
}

function formatDate(value?: string | null) {
  if (!value) return '';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function buildOpenMemoryTempleUrl(memoryId?: string | null) {
  const cleanMemoryId = String(memoryId ?? '').trim();

  if (!cleanMemoryId) {
    return FALLBACK_URL;
  }

  return `intent://memory/${encodeURIComponent(
    cleanMemoryId,
  )}#Intent;scheme=limiapp;package=ai.illimitable.memorytemple;S.browser_fallback_url=${encodeURIComponent(
    PLAY_STORE_URL,
  )};end`;
}

export default async function SharedMemoryPage({ params }: PageProps) {
  const { token } = await params;
  const data = await getSharedMemory(token);

  if (!data?.ok) {
    return (
      <main style={styles.page}>
        <section style={styles.emptyCard}>
          <p style={styles.brandEyebrow}>Limi</p>
          <h1 style={styles.emptyTitle}>Memory unavailable</h1>
          <p style={styles.emptyText}>This share link may have expired or been disabled.</p>
        </section>
      </main>
    );
  }

  const assets = ((data.assets ?? []) as SharedAsset[]).filter(
    (asset) => asset.thumbUrl || asset.url,
  );

  const title = data.share?.title || data.memory?.title || 'Shared memory';
  const story = data.share?.description || data.memory?.body || '';
  const date = formatDate(data.memory?.createdAt);
  const openMemoryTempleUrl = buildOpenMemoryTempleUrl(data.memory?.id);

  return (
    <main style={styles.page}>
      <section style={styles.shell}>
        <header style={styles.header}>
          <div>
            <p style={styles.brand}>✦ Limi</p>
            <p style={styles.byline}>Shared from Memory Temple</p>
          </div>

          <a style={styles.openButton} href={openMemoryTempleUrl}>
            Open Memory Temple
          </a>
        </header>

        <article style={styles.card}>
          <div style={styles.storyBlock}>
            {date ? <p style={styles.date}>{date}</p> : null}

            <h1 style={styles.title}>{title}</h1>

            {story ? <p style={styles.story}>{story}</p> : null}
          </div>

          {assets.length ? (
            <div style={styles.gallery}>
              {assets.map((asset) => {
                const src = asset.url || asset.thumbUrl || '';

                return (
                  <figure key={asset.id} style={styles.mediaFrame}>
                    <img src={src} alt={title} style={styles.image} />
                  </figure>
                );
              })}
            </div>
          ) : null}

          <footer style={styles.footer}>
            <p style={styles.footerTitle}>Memory Temple</p>
            <p style={styles.footerText}>A private place for memories, moments and meaning.</p>
          </footer>
        </article>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    margin: 0,
    background:
      'radial-gradient(circle at top left, rgba(124,92,232,0.16), transparent 34%), linear-gradient(180deg, #FBFAFF 0%, #F4F1FA 100%)',
    color: '#151827',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: 22,
  },
  shell: {
    width: '100%',
    maxWidth: 760,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginBottom: 18,
  },
  brand: {
    margin: 0,
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: -0.8,
  },
  byline: {
    margin: '2px 0 0',
    fontSize: 13,
    color: '#6B7280',
    fontWeight: 700,
  },
  openButton: {
    textDecoration: 'none',
    background: '#7C5CE8',
    color: '#FFFFFF',
    borderRadius: 999,
    padding: '11px 15px',
    fontSize: 13,
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },
  card: {
    background: 'rgba(255,255,255,0.86)',
    border: '1px solid rgba(17,24,39,0.07)',
    borderRadius: 32,
    overflow: 'hidden',
    boxShadow: '0 24px 70px rgba(51,35,102,0.14)',
  },
  storyBlock: {
    padding: '34px 30px 24px',
  },
  date: {
    margin: '0 0 14px',
    color: '#7C5CE8',
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(34px, 8vw, 58px)',
    lineHeight: 0.96,
    letterSpacing: -2.2,
    fontWeight: 950,
  },
  story: {
    margin: '20px 0 0',
    color: '#3F4658',
    fontSize: 'clamp(18px, 4vw, 23px)',
    lineHeight: 1.45,
    fontWeight: 650,
  },
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
    padding: '0 18px 18px',
  },
  mediaFrame: {
    margin: 0,
    borderRadius: 22,
    overflow: 'hidden',
    background: '#ECE8F5',
    aspectRatio: '4 / 5',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  footer: {
    margin: '0 18px 18px',
    padding: 18,
    borderRadius: 24,
    background: '#0B1020',
    color: '#FFFFFF',
  },
  footerTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 900,
  },
  footerText: {
    margin: '6px 0 0',
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    lineHeight: 1.5,
    fontWeight: 600,
  },
  emptyCard: {
    maxWidth: 440,
    margin: '18vh auto 0',
    background: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    textAlign: 'center',
    boxShadow: '0 24px 70px rgba(51,35,102,0.14)',
  },
  brandEyebrow: {
    margin: '0 0 8px',
    color: '#7C5CE8',
    fontSize: 13,
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyTitle: {
    margin: 0,
    fontSize: 30,
    fontWeight: 950,
    letterSpacing: -1,
  },
  emptyText: {
    margin: '12px 0 0',
    color: '#6B7280',
    fontSize: 15,
    lineHeight: 1.5,
    fontWeight: 650,
  },
};