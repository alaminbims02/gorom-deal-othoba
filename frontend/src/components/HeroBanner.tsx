'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSite } from './SiteProvider';
import { Icon } from './Icon';
import { Img } from './Img';
import type { BiText } from '@/lib/types';

interface Slide { enabled?: boolean; tag: BiText; title: BiText; subtitle: BiText; cta_text: BiText; cta_link: string; badge: BiText; image: string }
interface Point { icon: string; text: BiText }

export function HeroBanner({ slides: all, points, autoplay }: { slides: Slide[]; points: Point[]; autoplay: number }) {
  const { bi, t } = useSite();
  const slides = all.filter((s) => s.enabled !== false);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!autoplay || slides.length < 2) return;
    const id = setInterval(() => setI((x) => (x + 1) % slides.length), autoplay * 1000);
    return () => clearInterval(id);
  }, [autoplay, slides.length]);

  if (!slides.length) return null;
  const s = slides[i % slides.length];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-5" aria-roledescription="carousel">
      <div className="relative rounded-3xl bg-cream border border-brand/20 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 sm:p-10">
          <div className="lg:col-span-7 space-y-5 order-2 lg:order-1">
            {bi(s.tag) && <span className="inline-block bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">{bi(s.tag)}</span>}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink leading-tight">{bi(s.title)}</h1>
            {bi(s.subtitle) && <p className="text-stone-600 text-base sm:text-lg max-w-xl">{bi(s.subtitle)}</p>}
            <div className="flex flex-wrap items-center gap-4">
              {s.cta_link && bi(s.cta_text) && (
                <Link href={s.cta_link} className="inline-flex items-center gap-2 bg-brand hover:opacity-90 text-white font-semibold px-6 py-3 rounded-full shadow-md shadow-orange-500/20">
                  {bi(s.cta_text)}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
              {points.length > 0 && (
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600">
                  {points.map((p, k) => (
                    <li key={k} className="flex items-center gap-1.5"><Icon name={p.icon} className="w-4 h-4 text-brand" />{bi(p.text)}</li>
                  ))}
                </ul>
              )}
            </div>
            {slides.length > 1 && (
              <div className="flex items-center gap-2 pt-2">
                <button onClick={() => setI((i - 1 + slides.length) % slides.length)} className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:text-brand" aria-label={t('prev')}><ChevronLeft className="w-4 h-4" /></button>
                {slides.map((_, k) => (
                  <button key={k} onClick={() => setI(k)} aria-label={`${k + 1}`} aria-current={k === i % slides.length} className={`h-2 rounded-full transition-all ${k === i % slides.length ? 'w-6 bg-brand' : 'w-2 bg-stone-300'}`} />
                ))}
                <button onClick={() => setI((i + 1) % slides.length)} className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:text-brand" aria-label={t('next')}><ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="relative aspect-4/3 rounded-2xl bg-white border border-stone-100 shadow-sm overflow-hidden">
              <Img src={s.image} alt={bi(s.title)} priority sizes="(max-width: 1024px) 100vw, 40vw" className="object-contain p-4" />
              {bi(s.badge) && (
                <span className="absolute top-3 right-3 bg-gradient-to-tr from-accent to-brand text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow">{bi(s.badge)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
