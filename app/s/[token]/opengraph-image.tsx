// app/s/[token]/opengraph-image.tsx — v1.2 (Jun 2026)
// Premium social preview image for shared memories.
//
// v1.1 → v1.2:
// • VISUAL: full-width hero-photo layout with editorial lower panel.
// • BRAND: shifts from Limi-first to Memory Temple-first.
// • UX: stronger WhatsApp/Messenger readability at small preview sizes.
// • FALLBACK: polished text-only card when no image is available.
// • KEEP: safe token handling, 1200x630 PNG output.

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
  const text = String(value ?? '').trim().replace(/\s+/g, ' ');
  return text || fallback;
}

function truncate(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trim()}…`;
}

function formatDate(value?: string | null) {
  if (!value) return '';

  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return '';
  }
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
    58,
  );

  const description = truncate(
    cleanText(
      data?.share?.description || data?.memory?.body,
      'A private memory shared from Memory Temple.',
    ),
    118,
  );

  const date = formatDate(data?.memory?.createdAt);
  const image = data?.ok ? getPreviewImage(data) : null;

  if (!image) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            background:
              'linear-gradient(135deg, #F8F4FF 0%, #FFFFFF 54%, #EFE7FF 100%)',
            padding: 58,
            fontFamily: 'Arial',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: 44,
              background: '#FFFFFF',
              padding: 58,
              border: '1px solid rgba(124,92,232,0.16)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div
                style={{
                  display: 'flex',
                  fontSize: 30,
                  fontWeight: 900,
                  color: '#7C5CE8',
                }}
              >
                Memory Temple
              </div>

              {date ? (
                <div
                  style={{
                    display: 'flex',
                    fontSize: 24,
                    fontWeight: 800,
                    color: '#7C5CE8',
                  }}
                >
                  {date}
                </div>
              ) : null}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  fontSize: 82,
                  fontWeight: 900,
                  lineHeight: 0.94,
                  letterSpacing: -4,
                  color: '#101525',
                  marginBottom: 28,
                }}
              >
                {title}
              </div>

              <div
                style={{
                  display: 'flex',
                  fontSize: 34,
                  fontWeight: 700,
                  lineHeight: 1.28,
                  color: '#4B5563',
                  maxWidth: 900,
                }}
              >
                {description}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: 25,
                fontWeight: 800,
                color: '#101525',
              }}
            >
              Private memory shared with you
            </div>
          </div>
        </div>
      ),
      size,
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background:
            'linear-gradient(135deg, #F8F4FF 0%, #FFFFFF 50%, #EFE7FF 100%)',
          padding: 38,
          fontFamily: 'Arial',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 42,
            overflow: 'hidden',
            background: '#FFFFFF',
            border: '1px solid rgba(124,92,232,0.14)',
          }}
        >
          <div
            style={{
              width: '100%',
              height: 385,
              display: 'flex',
              position: 'relative',
              overflow: 'hidden',
              background: '#EDE9F7',
            }}
          >
            <img
              src={image}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 130,
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.34) 100%)',
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: 34,
                top: 30,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 999,
                padding: '14px 22px',
                background: 'rgba(255,255,255,0.92)',
                color: '#7C5CE8',
                fontSize: 24,
                fontWeight: 900,
              }}
            >
              Memory Temple
            </div>

            {date ? (
              <div
                style={{
                  position: 'absolute',
                  right: 34,
                  top: 30,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 999,
                  padding: '14px 22px',
                  background: 'rgba(255,255,255,0.92)',
                  color: '#101525',
                  fontSize: 22,
                  fontWeight: 900,
                }}
              >
                {date}
              </div>
            ) : null}
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '34px 44px 32px',
              background: '#FFFFFF',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 62,
                fontWeight: 900,
                lineHeight: 0.96,
                letterSpacing: -3,
                color: '#101525',
                marginBottom: 14,
              }}
            >
              {title}
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: 28,
                fontWeight: 700,
                lineHeight: 1.24,
                color: '#4B5563',
                maxWidth: 1030,
              }}
            >
              {description}
            </div>

            <div
              style={{
                display: 'flex',
                marginTop: 18,
                fontSize: 21,
                fontWeight: 800,
                color: '#7C5CE8',
              }}
            >
              Private memory shared with you
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}