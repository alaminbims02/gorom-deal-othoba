import type { NextRequest } from 'next/server';
import { badRequest, proxyToWp, readJson } from '@/lib/proxy';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const b = await readJson(req);
  if (!b || !Array.isArray(b.items)) return badRequest();
  const items = (b.items as Record<string, unknown>[]).slice(0, 50).map((i) => ({
    id: Number(i.id) || 0,
    qty: Number(i.qty) || 1,
    variant: typeof i.variant === 'string' ? i.variant.slice(0, 200) : '',
  }));
  return proxyToWp(req, 'quote', {
    method: 'POST',
    body: {
      items,
      district: typeof b.district === 'string' ? b.district.slice(0, 80) : '',
      coupon: typeof b.coupon === 'string' ? b.coupon.slice(0, 40) : '',
      lang: b.lang === 'en' ? 'en' : 'bn',
    },
  });
}
