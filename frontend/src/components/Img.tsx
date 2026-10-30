import Image from 'next/image';

/** WP ইমেজ: next/image (remotePatterns env থেকে)। খালি src হলে প্লেসহোল্ডার। */
export function Img({
  src, alt, className, sizes, priority, fill = true, width, height,
}: {
  src?: string; alt: string; className?: string; sizes?: string; priority?: boolean; fill?: boolean; width?: number; height?: number;
}) {
  if (!src) {
    return <div className={`bg-mist ${className || ''}`} role="img" aria-label={alt} />;
  }
  if (fill) {
    return <Image src={src} alt={alt} fill sizes={sizes || '(max-width: 768px) 50vw, 25vw'} className={className} priority={priority} />;
  }
  return <Image src={src} alt={alt} width={width || 400} height={height || 400} sizes={sizes} className={className} priority={priority} />;
}
