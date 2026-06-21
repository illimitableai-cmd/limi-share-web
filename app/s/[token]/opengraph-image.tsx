// app/s/[token]/opengraph-image.tsx — v1.0 (Jun 2026)
// Dynamic social preview image for shared memories.

import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

type Props = {
  params: Promise<{
    token: string;
  }>;
};

async function getSharedMemory(token: string) {
  const res = await fetch(
    `https://wuiqgeqxgsalnuzfaekz.supabase.co/functions/v1/public-memory-share?token=${encodeURIComponent(token)}`,
    { cache: 'no-store' },
  );

  if (!res.ok) return null;
  return res.json();
}

export default async function OpenGraphImage({ params }: Props) {
  const { token } = await params;
  const data = await getSharedMemory(token);

  const title = data?.share?.title || data?.memory?.title || 'Shared memory';
  const description =
    data?.share?.description ||
    data?.memory?.body ||
    'A private memory shared from Memory Temple.';

  const image =
    data?.assets?.find((asset: any) => asset?.kind === 'photo' && (asset?.url || asset?.thumbUrl))
      ?.url ||
    data?.assets?.find((asset: any) => asset?.url || asset?.thumbUrl)?.url ||
    data?.coverImage ||
    null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#F7F2FF',
          padding: 48,
          fontFamily: 'Arial',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            borderRadius: 42,
            overflow: 'hidden',
            background: '#FFFFFF',
            boxShadow: '0 24px 80px rgba(51,35,102,0.18)',
          }}
        >
          {image ? (
            <img
              src={image}
              alt=""
              style={{
                width: 520,
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : null}

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: 52,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  color: '#7C5CE8',
                  marginBottom: 34,
                }}
              >
                ✦ Limi
              </div>

              <div
                style={{
                  fontSize: 64,
                  fontWeight: 900,
                  lineHeight: 0.95,
                  color: '#111827',
                  letterSpacing: -3,
                  marginBottom: 24,
                }}
              >
                {title}
              </div>

              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: '#4B5563',
                }}
              >
                {description}
              </div>
            </div>

            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: '#111827',
              }}
            >
              Shared from Memory Temple
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}