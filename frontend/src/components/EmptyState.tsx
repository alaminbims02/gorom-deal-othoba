'use client';

import Link from 'next/link';
import { PackageOpen } from 'lucide-react';
import { useSite } from './SiteProvider';

export function EmptyState({ title, hint, cta = true }: { title?: string; hint?: string; cta?: boolean }) {
  const { t } = useSite();
  return (
    <div className="flex flex-col items-center text-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center mb-4"><PackageOpen className="w-8 h-8 text-brand" /></div>
      <h2 className="text-lg font-bold text-ink">{title || t('no_data_title')}</h2>
      <p className="text-sm text-stone-500 mt-1 max-w-md">{hint || t('no_data_hint')}</p>
      {cta && <Link href="/" className="mt-5 px-5 py-2.5 rounded-full bg-brand text-white text-sm font-semibold hover:opacity-90">{t('back_home')}</Link>}
    </div>
  );
}
