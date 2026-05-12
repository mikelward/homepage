import { useMemo, useState } from 'react';
import { buildFaviconCandidates } from '../lib/favicon';

type Props = {
  url: string;
  /** Display label, used for the alt text — falls back to the hostname. */
  label?: string;
  size?: number;
};

/**
 * Renders the best available favicon for a URL.
 *
 * Tries the site's own apple-touch-icon first, falls back through the
 * Google S2 favicon service, and finally to an inline globe SVG. The
 * service worker caches the successful response so it loads instantly
 * offline next time.
 */
export function LinkIcon({ url, label, size = 56 }: Props) {
  const candidates = useMemo(() => buildFaviconCandidates(url), [url]);
  const [idx, setIdx] = useState(0);

  if (candidates.length === 0 || idx >= candidates.length) {
    return <GlobeIcon size={size} aria-hidden="true" />;
  }

  return (
    <img
      key={candidates[idx]}
      src={candidates[idx]}
      alt={label ?? ''}
      width={size}
      height={size}
      loading="eager"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setIdx((i) => i + 1)}
    />
  );
}

function GlobeIcon({ size }: { size: number } & React.AriaAttributes) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a13 13 0 0 1 0 18" />
      <path d="M12 3a13 13 0 0 0 0 18" />
    </svg>
  );
}
