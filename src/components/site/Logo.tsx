export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect x="4" y="4" width="22" height="22" fill="var(--ink)" />
      <circle cx="26" cy="26" r="11" fill="var(--human)" />
    </svg>
  );
}
