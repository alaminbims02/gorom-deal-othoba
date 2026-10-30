'use client';

import Link from 'next/link';
import { Clock, Flame, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useSite } from './SiteProvider';
import type { MenuItem } from '@/lib/types';

function FooterLinks({ items }: { items: MenuItem[] }) {
  const { bi } = useSite();
  if (!items.length) return null;
  return (
    <ul className="space-y-2.5 text-sm">
      {items.map((it) => (
        <li key={it.id}>
          {it.external ? (
            <a href={it.path} target={it.target || undefined} rel="noopener noreferrer" className="text-stone-400 hover:text-brand transition-colors">{bi(it.title)}</a>
          ) : (
            <Link href={it.path || '/'} className="text-stone-400 hover:text-brand transition-colors">{bi(it.title)}</Link>
          )}
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  const { settings, menu, bi, t } = useSite();
  const g = settings.general || {};
  const f = settings.footer || {};
  const c = settings.contact || {};
  const social: [string, string][] = [
    ['Facebook', f.facebook], ['Instagram', f.instagram], ['YouTube', f.youtube], ['TikTok', f.tiktok], ['X', f.x],
  ];
  const activeSocial = social.filter(([, url]) => !!url);
  const payments: { label: string; color: string }[] = Array.isArray(f.payments) ? f.payments : [];
  const logoMain = bi(g.logo_main) || bi(g.site_name);
  const logoAccent = bi(g.logo_accent);
  const wa = String(c.whatsapp || '').replace(/[^\d]/g, '');

  return (
    <footer className="bg-ink text-stone-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {g.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={g.logo} alt={bi(g.site_name)} className="h-10 w-auto object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent to-brand text-white flex items-center justify-center"><Flame className="w-6 h-6" /></div>
            )}
            <span className="text-2xl font-bold text-white">{logoMain}{logoAccent && <span className="text-brand">{logoAccent}</span>}</span>
          </div>
          {f.about && <p className="text-sm text-stone-400 leading-relaxed">{bi(f.about)}</p>}
          {activeSocial.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {activeSocial.map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-brand text-white transition-colors">{name}</a>
              ))}
            </div>
          )}
        </div>

        {menu.footer_col1.length > 0 && (
          <div>
            <h3 className="text-white font-bold mb-4">{bi(f.col1_title)}</h3>
            <FooterLinks items={menu.footer_col1} />
          </div>
        )}
        {menu.footer_col2.length > 0 && (
          <div>
            <h3 className="text-white font-bold mb-4">{bi(f.col2_title)}</h3>
            <FooterLinks items={menu.footer_col2} />
          </div>
        )}

        <div>
          <h3 className="text-white font-bold mb-4">{t('contact_us')}</h3>
          <ul className="space-y-3 text-sm text-stone-400">
            {c.address && <li className="flex gap-2"><MapPin className="w-4 h-4 mt-0.5 text-brand shrink-0" /><span>{bi(c.address)}</span></li>}
            {c.hotline && <li className="flex gap-2"><Phone className="w-4 h-4 mt-0.5 text-brand shrink-0" /><a href={`tel:${String(c.hotline).replace(/[^\d+]/g, '')}`} className="hover:text-brand">{c.hotline}</a></li>}
            {c.hours && <li className="flex gap-2"><Clock className="w-4 h-4 mt-0.5 text-brand shrink-0" /><span>{bi(c.hours)}</span></li>}
            {c.email && <li className="flex gap-2"><Mail className="w-4 h-4 mt-0.5 text-brand shrink-0" /><a href={`mailto:${c.email}`} className="hover:text-brand break-all">{c.email}</a></li>}
            {wa && <li className="flex gap-2"><MessageCircle className="w-4 h-4 mt-0.5 text-brand shrink-0" /><a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand">WhatsApp</a></li>}
            {c.map_url && <li><a href={c.map_url} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Google Maps →</a></li>}
          </ul>
          {payments.length > 0 && (
            <div className="mt-5">
              <h4 className="text-white text-sm font-semibold mb-2">{bi(f.col3_title)}</h4>
              <div className="flex flex-wrap gap-2">
                {payments.map((p, i) => (
                  <span key={i} className="px-2.5 py-1 text-xs font-semibold text-white rounded" style={{ background: /^#[0-9a-fA-F]{6}$/.test(p.color) ? p.color : '#444' }}>{p.label}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <div className="text-center md:text-left space-y-1">
            {f.copyright && <p>© {new Date().getFullYear()} {bi(f.copyright)}</p>}
            {(f.trade_license || f.dbid) && (
              <p>
                {f.trade_license && <span>{t('trade_license')}: {f.trade_license}</span>}
                {f.trade_license && f.dbid && <span> · </span>}
                {f.dbid && <span>{t('dbid')}: {f.dbid}</span>}
              </p>
            )}
          </div>
          {menu.footer_policy.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {menu.footer_policy.map((it) =>
                it.external ? (
                  <a key={it.id} href={it.path} target={it.target || undefined} rel="noopener noreferrer" className="hover:text-brand">{bi(it.title)}</a>
                ) : (
                  <Link key={it.id} href={it.path || '/'} className="hover:text-brand">{bi(it.title)}</Link>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
