// app/s/[token]/opengraph-image.tsx — v1.3 (Jun 2026)
// Premium social preview image for shared memories.
//
// v1.2 → v1.3:
// • VISUAL: simpler, more clickable memory-card layout.
// • VISUAL: stronger photo-first design when media exists.
// • VISUAL: cleaner text-only fallback for memories without media.
// • COPY: uses “Private memory shared with you”.
// • KEEP: stable 1200x630 PNG output for WhatsApp/Messenger previews.

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
    56,
  );

  const description = truncate(
    cleanText(
      data?.share?.description || data?.memory?.body,
      'A private memory shared from Memory Temple.',
    ),
    112,
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
            background: '#F4F0FF',
            padding: 44,
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
              borderRadius: 46,
              background: '#FFFFFF',
              padding: 58,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 28,
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
                    fontSize: 23,
                    fontWeight: 900,
                    color: '#7C5CE8',
                    background: '#F3EEFF',
                    borderRadius: 999,
                    padding: '12px 20px',
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
                  fontSize: 84,
                  fontWeight: 900,
                  lineHeight: 0.92,
                  letterSpacing: -4,
                  color: '#101525',
                  marginBottom: 30,
                }}
              >
                {title}
              </div>

              <div
                style={{
                  display: 'flex',
                  fontSize: 35,
                  fontWeight: 700,
                  lineHeight: 1.24,
                  color: '#4B5563',
                  maxWidth: 940,
                }}
              >
                {description}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: 25,
                fontWeight: 900,
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
          background: '#F4F0FF',
          padding: 34,
          fontFamily: 'Arial',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            borderRadius: 46,
            overflow: 'hidden',
            background: '#FFFFFF',
          }}
        >
          <div
            style={{
              width: 680,
              height: '100%',
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
                left: 28,
                top: 28,
                display: 'flex',
                borderRadius: 999,
                padding: '13px 20px',
                background: 'rgba(255,255,255,0.92)',
                color: '#7C5CE8',
                fontSize: 23,
                fontWeight: 900,
              }}
            >
              Memory Temple
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '46px 48px',
            }}
          >
            {date ? (
              <div
                style={{
                  display: 'flex',
                  alignSelf: 'flex-start',
                  borderRadius: 999,
                  padding: '12px 19px',
                  background: '#F3EEFF',
                  color: '#7C5CE8',
                  fontSize: 22,
                  fontWeight: 900,
                }}
              >
                {date}
              </div>
            ) : (
              <div />
            )}

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  fontSize: 66,
                  fontWeight: 900,
                  lineHeight: 0.94,
                  letterSpacing: -3,
                  color: '#101525',
                  marginBottom: 22,
                }}
              >
                {title}
              </div>

              <div
                style={{
                  display: 'flex',
                  fontSize: 29,
                  fontWeight: 700,
                  lineHeight: 1.25,
                  color: '#4B5563',
                }}
              >
                {description}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: 23,
                fontWeight: 900,
                color: '#101525',
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