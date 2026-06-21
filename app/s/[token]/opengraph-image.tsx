// app/s/[token]/opengraph-image.tsx — v1.1 (Jun 2026)
// Dynamic social preview image for shared memories.
//
// v1.0 → v1.1:
// • Safer image picking: url, thumbUrl, coverImage all supported.
// • Safer fallback when token is invalid.
// • Removes unsupported symbol rendering issue.
// • Keeps output as 1200x630 PNG for social previews.

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

type SharedAsset = {
  id?: string;
  kind?: 'photo' | 'video' | string;
  url?: string | null;
  thumbUrl?: string | null;
};

async function getSharedMemory(token: string) {
  const res = await fetch(
    `https://wuiqgeqxgsalnuzfaekz.supabase.co/functions/v1/public-memory-share?token=${encodeURIComponent(token)}`,
    { cache: 'no-store' },
  );

  if (!res.ok) return null;
  return res.json();
}

function cleanText(value: unknown, fallback: string) {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function truncate(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trim()}…`;
}

function getPreviewImage(data: any) {
  const assets = ((data?.assets ?? []) as SharedAsset[]).filter(
    (asset) => asset.url || asset.thumbUrl,
  );

  const firstPhoto = assets.find((asset) => asset.kind === 'photo');
  const firstAsset = firstPhoto ?? assets[0] ?? null;

  return (
    firstAsset?.url ||
    firstAsset?.thumbUrl ||
    data?.coverImage ||
    data?.shareCardImage ||
    null
  );
}

export default async function OpenGraphImage({ params }: Props) {
  const { token } = await params;
  const data = await getSharedMemory(token);

  const title = truncate(
    cleanText(data?.share?.title || data?.memory?.title, 'Shared memory'),
    68,
  );

  const description = truncate(
    cleanText(
      data?.share?.description || data?.memory?.body,
      'A private memory shared from Memory Temple.',
    ),
    110,
  );

  const image = data?.ok ? getPreviewImage(data) : null;

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
                Limi
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