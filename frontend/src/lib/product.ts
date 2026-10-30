import type { Product } from './types';

/** লিস্ট/কার্ডের জন্য হালকা সংস্করণ (বড় টেক্সট বাদ) — RSC payload ছোট রাখতে */
export function slim(p: Product): Product {
  return { ...p, description: '', descriptionEn: '', features: [], specs: [], options: p.options, images: p.images.slice(0, 1) };
}
