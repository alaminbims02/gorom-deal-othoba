import type { NextRequest } from 'next/server';
import { badRequest, proxyToWp, readJson } from '@/lib/proxy';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const b = await readJson(req);
  if (!b || !Array.isArray(b.items)) return badRequest();
  // শুধু অনুমোদিত ফিল্ড; দাম ক্লায়েন্ট থেকে নেওয়া হয় না — প্লাগিন সার্ভারে পুনর্গণনা করে
  const items = (b.items as Record<string, unknown>[]).slice(0, 50).map((i) => ({
    id: Number(i.id) || 0,
    qty: Number(i.qty) || 1,
    variant: typeof i.variant === 'string' ? i.variant.slice(0, 200) : '',
  }));
  const s = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : '');
  return proxyToWp(req, 'order', {
    method: 'POST',
    body: {
      items,
      name: s(b.name, 120),
      phone: s(b.phone, 20),
      address: s(b.address, 400),
      district: s(b.district, 80),
      email: s(b.email, 120),
      note: s(b.note, 500),
      coupon: s(b.coupon, 40),
      lang: b.lang === 'en' ? 'en' : 'bn',
      website: s(b.website, 100),
    },
  });
}
