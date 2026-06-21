'use client';

type Props = {
  memoryId?: string | null;
};

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=ai.illimitable.memorytemple';

function isAndroid() {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

export function OpenMemoryTempleButton({ memoryId }: Props) {
  const cleanMemoryId = String(memoryId ?? '').trim();

  function handleClick() {
    if (isAndroid() && cleanMemoryId) {
      window.location.href = `intent://memory/${encodeURIComponent(
        cleanMemoryId,
      )}#Intent;scheme=limiapp;package=ai.illimitable.memorytemple;S.browser_fallback_url=${encodeURIComponent(
        PLAY_STORE_URL,
      )};end`;

      return;
    }

    window.location.href = PLAY_STORE_URL;
  }

  return (
    <button type="button" onClick={handleClick} style={buttonStyle}>
      Open Memory Temple
    </button>
  );
}

const buttonStyle: React.CSSProperties = {
  border: 0,
  cursor: 'pointer',
  textDecoration: 'none',
  background: '#7C5CE8',
  color: '#FFFFFF',
  borderRadius: 999,
  padding: '11px 15px',
  fontSize: 13,
  fontWeight: 900,
  whiteSpace: 'nowrap',
};