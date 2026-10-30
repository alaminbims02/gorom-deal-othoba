import type { Metadata } from 'next';
import { TrackView } from '@/components/TrackView';

export const metadata: Metadata = { title: 'Track order', robots: { index: false, follow: false } };

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return <TrackView initialOrder={typeof order === 'string' ? order.slice(0, 40) : ''} />;
}
