/**
 * Tiny navbar logo mark.
 *
 * Renders the site favicon as a 28×28 image so every top-left logo
 * across the app stays in sync — replacing the per-module gradient
 * placeholders that used to live as `<div className={styles.logoMark} />`.
 *
 * Accepts the per-page `logoMark` className so dimensions can still be
 * adjusted via the page's CSS module if needed (defaults to 28×28).
 */
export function NavLogo({ className }: { className?: string }) {
  return (
    // Plain <img>: the asset is already 32px and loads instantly from
    // `/favicon.ico`; next/image would add unnecessary optimization
    // pipeline for what's effectively a static icon.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/favicon.ico"
      alt=""
      aria-hidden="true"
      width={28}
      height={28}
      className={className}
    />
  );
}
