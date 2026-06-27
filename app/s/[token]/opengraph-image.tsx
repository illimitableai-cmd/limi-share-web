// app/s/[token]/opengraph-image.tsx — v1.5 (Jun 2026)
// Tap-first social preview image for shared memories.
//
// v1.4 → v1.5:
// • VISUAL: moves to large photo-led memory card.
// • VISUAL: overlays title on a soft dark gradient for stronger tap appeal.
// • VISUAL: reduces white panel weight and makes the image feel emotional first.
// • FALLBACK: keeps clean premium text-only card for memories without media.
// • KEEP: lightweight 800x420 PNG output for WhatsApp reliability.

import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 800,
  height: 420,
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
    48,
  );

  const description = truncate(
    cleanText(
      data?.share?.description || data?.memory?.body,
      'A private memory shared from Memory Temple.',
    ),
    82,
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
            padding: 28,
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
              borderRadius: 32,
              background: '#FFFFFF',
              padding: 38,
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
                  fontSize: 20,
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
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#7C5CE8',
                    background: '#F3EEFF',
                    borderRadius: 999,
                    padding: '8px 14px',
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
                  fontSize: 52,
                  fontWeight: 900,
                  lineHeight: 0.94,
                  letterSpacing: -2.4,
                  color: '#101525',
                  marginBottom: 18,
                }}
              >
                {title}
              </div>

              <div
                style={{
                  display: 'flex',
                  fontSize: 22,
                  fontWeight: 700,
                  lineHeight: 1.24,
                  color: '#4B5563',
                  maxWidth: 660,
                }}
              >
                {description}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: 17,
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
          padding: 20,
          fontFamily: 'Arial',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            position: 'relative',
            borderRadius: 32,
            overflow: 'hidden',
            background: '#111827',
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
              inset: 0,
              display: 'flex',
              background:
                'linear-gradient(180deg, rgba(5,8,18,0.08) 0%, rgba(5,8,18,0.15) 34%, rgba(5,8,18,0.82) 100%)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: 24,
              top: 22,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 999,
              padding: '8px 14px',
              background: 'rgba(255,255,255,0.92)',
              color: '#7C5CE8',
              fontSize: 16,
              fontWeight: 900,
            }}
          >
            Memory Temple
          </div>

          {date ? (
            <div
              style={{
                position: 'absolute',
                right: 24,
                top: 22,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 999,
                padding: '8px 14px',
                background: 'rgba(255,255,255,0.92)',
                color: '#101525',
                fontSize: 15,
                fontWeight: 900,
              }}
            >
              {date}
            </div>
          ) : null}

          <div
            style={{
              position: 'absolute',
              left: 34,
              right: 34,
              bottom: 30,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 56,
                fontWeight: 900,
                lineHeight: 0.94,
                letterSpacing: -2.4,
                color: '#FFFFFF',
                marginBottom: 12,
                textShadow: '0 2px 16px rgba(0,0,0,0.35)',
              }}
            >
              {title}
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: 22,
                fontWeight: 750,
                lineHeight: 1.22,
                color: 'rgba(255,255,255,0.9)',
                maxWidth: 690,
                textShadow: '0 2px 12px rgba(0,0,0,0.36)',
              }}
            >
              {description}
            </div>

            <div
              style={{
                display: 'flex',
                marginTop: 16,
                fontSize: 16,
                fontWeight: 900,
                color: '#FFFFFF',
                opacity: 0.96,
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