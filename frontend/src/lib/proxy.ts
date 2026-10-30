import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { HAS_WP, WC_URL } from './env';

function clientIp(req: NextRequest): string {
  const xf = req.headers.get('x-forwarded-for');
  const ip = (xf ? xf.split(',')[0] : req.headers.get('x-real-ip')) || '';
  return ip.trim().slice(0, 64);
}

/**
 * ব্রাউজার → Next route handler → WP প্লাগিন (gd/v1)।
 * GD_PROXY_SECRET দিয়ে প্লাগিন আসল ক্লায়েন্ট IP বিশ্বাস করে (রেট-লিমিটের জন্য)।
 */
export async function proxyToWp(req: NextRequest, path: string, init: { method: 'GET' | 'POST'; body?: unknown; query?: Record<string, string> }) {
  if (!HAS_WP) {
    return NextResponse.json({ code: 'no_backend', message: 'Backend is not configured', data: { status: 503 } }, { status: 503 });
  }
  const qs = init.query ? `?${new URLSearchParams(init.query).toString()}` : '';
  const headers: Record<string, string> = { Accept: 'application/json', 'X-GD-Client-IP': clientIp(req) };
  if (process.env.GD_PROXY_SECRET) headers['X-GD-Proxy-Key'] = process.env.GD_PROXY_SECRET;
  if (init.body !== undefined) headers['Content-Type'] = 'application/json';
  try {
    const res = await fetch(`${WC_URL}/wp-json/gd/v1/${path}${qs}`, {
      method: init.method,
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    });
    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      json = { code: 'bad_response', message: 'Unexpected response', data: { status: 502 } };
      return NextResponse.json(json, { status: 502 });
    }
    return NextResponse.json(json, { status: res.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ code: 'unreachable', message: 'Backend unreachable', data: { status: 502 } }, { status: 502 });
  }
}

export async function readJson(req: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const len = Number(req.headers.get('content-length') || 0);
    if (len > 50_000) return null;
    const b = await req.json();
    return b && typeof b === 'object' ? (b as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function badRequest() {
  return NextResponse.json({ code: 'bad_request', message: 'Bad request', data: { status: 400 } }, { status: 400 });
}
