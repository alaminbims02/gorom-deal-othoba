'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, Flame, Heart, Layers, Menu, Phone, Search, ShoppingCart, Truck, X } from 'lucide-react';
import { useSite } from './SiteProvider';
import { useCart, selectCount, selectSubtotal } from '@/store/cart';
import { useWishlist } from '@/store/wishlist';
import type { MenuItem } from '@/lib/types';

function NavLink({ item, className }: { item: MenuItem; className: string }) {
  const { bi } = useSite();
  if (item.external) {
    return (
      <a href={item.path} target={item.target || undefined} rel="noopener noreferrer" className={className}>
        {bi(item.title)}
      </a>
    );
  }
  return (
    <Link href={item.path || '/'} className={className}>
      {bi(item.title)}
    </Link>
  );
}

export function Header() {
  const { settings, menu, categories, lang, setLang, t, bi, catName, money, num } = useSite();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const count = useCart(selectCount);
  const subtotal = useCart(selectSubtotal);
  const wishCount = useWishlist((s) => s.items.length);

  const g = settings.general || {};
  const top = settings.topbar || {};
  const contact = settings.contact || {};
  const logoMain = bi(g.logo_main);
  const logoAccent = bi(g.logo_accent);
  const siteName = bi(g.site_name);
  const showToggle = g.lang_toggle !== false;
  const navItems = menu.header;
  const ticker: { text: BiTextLike; link: string }[] = Array.isArray(top.ticker) ? top.ticker : [];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-mist shadow-xs">
      {top.enabled !== false && (top.left_text || contact.hotline || top.show_track || showToggle) && (
        <div className="bg-ink text-white text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between gap-3">
            <span className="hidden sm:flex items-center gap-1.5 font-medium text-white/90">
              {bi(top.left_text)}
            </span>
            <div className="flex items-center gap-4 ml-auto">
              {top.show_phone && contact.hotline && (
                <a href={`tel:${String(contact.hotline).replace(/[^\d+]/g, '')}`} className="flex items-center gap-1.5 hover:text-brand">
                  <Phone className="w-3 h-3" />
                  <span>{contact.hotline}</span>
                </a>
              )}
              {top.show_track && (
                <Link href="/track" className="flex items-center gap-1 hover:text-brand">
                  <Truck className="w-3 h-3" />
                  {t('track_order')}
                </Link>
              )}
              {showToggle && (
                <button
                  onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
                  className="font-semibold px-1.5 py-0.5 border border-white/30 rounded hover:border-brand hover:text-brand"
                  aria-label={t('language')}
                >
                  {lang === 'bn' ? 'EN' : 'বাং'}
                </button>
              )}
            </div>
          </div>
          {top.ticker_enabled && ticker.length > 0 && (
            <div className="bg-brand/90 text-white overflow-hidden">
              <div className="gd-marquee flex whitespace-nowrap w-max py-1" style={{ ['--gd-marquee-speed' as string]: `${Number(top.ticker_speed) || 30}s` }}>
                {[0, 1].map((dup) => (
                  <div key={dup} className="flex shrink-0" aria-hidden={dup === 1}>
                    {ticker.map((tk, i) => {
                      const text = bi(tk.text as never);
                      return tk.link ? (
                        <a key={i} href={tk.link} className="px-8 hover:underline">{text}</a>
                      ) : (
                        <span key={i} className="px-8">{text}</span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 group select-none" aria-label={siteName || 'Home'}>
            {g.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={g.logo} alt={siteName} className="h-10 w-auto object-contain" />
            ) : (
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-accent to-brand text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-ink leading-tight">
                {logoMain || siteName}
                {logoAccent && <span className="text-brand">{logoAccent}</span>}
              </span>
              {g.tagline && <span className="hidden sm:block text-[10px] tracking-wider text-stone-500 -mt-1 font-medium">{bi(g.tagline)}</span>}
            </div>
          </Link>

          {categories.length > 0 && (
            <div className="relative hidden xl:block">
              <button
                onClick={() => setCatOpen(!catOpen)}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-cream hover:bg-orange-50 text-ink border border-brand/30 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
                aria-expanded={catOpen}
              >
                <Layers className="w-4 h-4 text-brand" />
                <span>{t('all_categories')}</span>
                <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
              </button>
              {catOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      onClick={() => setCatOpen(false)}
                      className="px-4 py-2.5 text-sm flex items-center justify-between text-stone-700 hover:bg-cream hover:text-brand"
                    >
                      <span>{catName(c.slug, c.name)}</span>
                      <span className="text-xs text-stone-400">({num(c.count)})</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          <form action="/search" method="get" role="search" className="flex-1 max-w-2xl hidden sm:block">
            <div className="flex items-center bg-mist focus-within:bg-white rounded-full border border-transparent focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 transition-all overflow-hidden">
              <div className="pl-4 text-stone-400"><Search className="w-4 h-4" /></div>
              <input
                type="search"
                name="q"
                placeholder={t('search_placeholder')}
                className="w-full py-2.5 px-3 text-sm text-ink bg-transparent outline-none placeholder:text-stone-400"
                aria-label={t('search_title')}
              />
              <button type="submit" className="bg-brand hover:opacity-90 text-white px-5 py-2.5 font-medium text-sm whitespace-nowrap">
                {t('search_button')}
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0">
            <Link href="/wishlist" className="relative p-2 text-stone-700 hover:text-accent rounded-xl hover:bg-stone-100 transition-colors" aria-label={t('wishlist')}>
              <Heart className="w-5 h-5" />
              {wishCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{num(wishCount)}</span>
              )}
            </Link>
            <Link href="/cart" className="flex items-center gap-2.5 px-3 py-2 bg-cream hover:bg-orange-50 border border-brand/40 rounded-xl text-ink transition-all group" aria-label={t('my_cart')}>
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-brand group-hover:scale-110 transition-transform" />
                <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center border-2 border-white">{num(count)}</span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] text-stone-500 leading-none font-medium">{t('subtotal')}</span>
                <span className="text-xs font-bold text-brand leading-tight">{money(subtotal)}</span>
              </div>
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-stone-700 hover:text-brand rounded-lg" aria-label={t('menu')} aria-expanded={mobileOpen}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {(navItems.length > 0 || categories.length > 0) && (
        <nav className="hidden lg:block bg-white border-t border-stone-200/80" aria-label="Main">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-1 xl:gap-2 py-1.5 overflow-x-auto no-scrollbar text-xs">
              {navItems.length > 0
                ? navItems.map((it) => (
                    <NavLink key={it.id} item={it} className="px-3 py-1.5 rounded-lg font-medium text-stone-700 hover:text-brand hover:bg-stone-50 transition-colors shrink-0 whitespace-nowrap" />
                  ))
                : categories.slice(0, 8).map((c) => (
                    <Link key={c.id} href={`/category/${c.slug}`} className="px-3 py-1.5 rounded-lg font-medium text-stone-700 hover:text-brand hover:bg-stone-50 transition-colors shrink-0 whitespace-nowrap">
                      {catName(c.slug, c.name)}
                    </Link>
                  ))}
            </div>
          </div>
        </nav>
      )}

      {mobileOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-4">
          <form action="/search" method="get" role="search" className="sm:hidden">
            <div className="flex items-center bg-mist rounded-full overflow-hidden">
              <input type="search" name="q" placeholder={t('search_placeholder')} className="w-full py-2.5 px-4 text-sm bg-transparent outline-none" aria-label={t('search_title')} />
              <button type="submit" className="bg-brand text-white px-4 py-2.5 text-sm font-medium">{t('search_button')}</button>
            </div>
          </form>
          {categories.length > 0 && (
            <>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{t('all_categories')}</p>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((c) => (
                  <Link key={c.id} href={`/category/${c.slug}`} onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-lg bg-stone-50 text-stone-700 hover:bg-stone-100">
                    {catName(c.slug, c.name)}
                  </Link>
                ))}
              </div>
            </>
          )}
          {navItems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {navItems.map((it) => (
                <NavLink key={it.id} item={it} className="px-3 py-1.5 text-sm rounded-lg border border-stone-200 text-stone-700" />
              ))}
            </div>
          )}
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
            <Link href="/track" onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5 font-medium text-brand">
              <Truck className="w-4 h-4" />
              {t('track_order')}
            </Link>
            {showToggle && (
              <button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} className="px-2.5 py-1 bg-stone-100 rounded-md font-semibold text-stone-800">
                {lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

type BiTextLike = { bn: string; en: string } | string;
