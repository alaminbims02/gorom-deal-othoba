import type { NextRequest } from 'next/server';
import { badRequest, proxyToWp } from '@/lib/proxy';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const order = (sp.get('order') || '').slice(0, 40);
  const phone = (sp.get('phone') || '').slice(0, 20);
  if (!order || !phone) return badRequest();
  return proxyToWp(req, 'track', { method: 'GET', query: { order, phone, lang: sp.get('lang') === 'en' ? 'en' : 'bn' } });
}
