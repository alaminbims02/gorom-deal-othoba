import { timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * WP প্লাগিনের webhook: JSON { secret, tags[], paths[] } (বা Authorization: Bearer <secret>)।
 * REVALIDATE_SECRET সেট না থাকলে 503।
 */
export async function POST(req: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET || '';
  if (!expected) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });

  let body: { secret?: unknown; tags?: unknown; paths?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body allowed — secret may come from header */
  }
  const bearer = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const given = typeof body.secret === 'string' ? body.secret : bearer;
  if (!given || !safeEqual(given, expected)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const tags = (Array.isArray(body.tags) ? body.tags : []).filter((t): t is string => typeof t === 'string' && /^[a-z0-9:_-]{1,100}$/i.test(t)).slice(0, 50);
  const paths = (Array.isArray(body.paths) ? body.paths : []).filter((p): p is string => typeof p === 'string' && p.startsWith('/') && p.length < 200).slice(0, 50);

  // কিছু না দিলে সব মূল ট্যাগ রিফ্রেশ
  const useTags = tags.length || paths.length ? tags : ['products', 'categories', 'settings', 'menu', 'pages'];
  for (const t of useTags) revalidateTag(t, 'max');
  for (const p of paths) revalidatePath(p);
  if (!paths.length && !tags.length) revalidatePath('/', 'layout');

  return NextResponse.json({ ok: true, tags: useTags, paths });
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'method_not_allowed' }, { status: 405 });
}
