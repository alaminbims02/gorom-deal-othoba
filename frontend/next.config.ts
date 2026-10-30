import type { NextConfig } from 'next';

// next/image-এর জন্য অনুমোদিত হোস্ট: WC_URL-এর হোস্ট + WP_IMAGE_HOSTS (কমা দিয়ে আলাদা)।
function imageHosts(): string[] {
  const hosts = new Set<string>();
  try {
    if (process.env.WC_URL) hosts.add(new URL(process.env.WC_URL).hostname);
  } catch {
    /* ignore invalid URL */
  }
  (process.env.WP_IMAGE_HOSTS || '')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean)
    .forEach((h) => hosts.add(h));
  return [...hosts];
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: imageHosts().flatMap((hostname) => [
      { protocol: 'https' as const, hostname },
      { protocol: 'http' as const, hostname },
    ]),
    // লোকাল WP (localhost) ব্যবহার করলে WP_IMAGE_UNOPTIMIZED=1 দিন।
    unoptimized: process.env.WP_IMAGE_UNOPTIMIZED === '1',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default nextConfig;
