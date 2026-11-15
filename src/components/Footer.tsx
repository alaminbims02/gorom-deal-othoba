import React, { useState } from 'react';
import { useSite } from '../context/SiteContext';
import { Mail, Send, CheckCircle2, Phone, MapPin, Shield } from 'lucide-react';
import { subscribeNewsletter } from '../services/api';

interface FooterProps {
  onSelectCategory: (id: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory }) => {
  const { t, tx, settings } = useSite();
  const { footer, contact, general } = settings;
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      await subscribeNewsletter(email.trim());
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    } catch (err: any) {
      setError(err?.message || t('common.error_try_again'));
    } finally {
      setBusy(false);
    }
  };

  const columnCount = footer.columns.length;

  return (
    <footer className="bg-[#252525] text-stone-300 pt-10 sm:pt-12 pb-24 sm:pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Footer Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pb-8 sm:pb-10 border-b border-stone-700/80 lg:[grid-template-columns:var(--gd-footer-cols)]"
          style={{ ['--gd-footer-cols' as any]: `2fr repeat(${columnCount + 1}, minmax(0, 1fr))` }}
        >
          {/* Brand Information */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <div className="inline-flex items-center bg-white px-3 py-1.5 rounded-xl">
              <img src={general.logo} alt={tx(general.logoAlt)} className="h-8 sm:h-9 w-auto object-contain" />
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">{tx(footer.about)}</p>

            <div className="space-y-2 text-xs text-stone-400 pt-1">
              {tx(contact.address) && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#F36B0B] shrink-0 mt-0.5" />
                  <span>{tx(contact.address)}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#F36B0B] shrink-0" />
                  <a href={`tel:${contact.phone}`} className="hover:text-white">
                    {t('footer.hotline', [tx(contact.phoneDisplay) || contact.phone, tx(contact.hours)])}
                  </a>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#F36B0B] shrink-0" />
                  <a href={`mailto:${contact.email}`} className="hover:text-white">
                    {t('footer.email', [contact.email])}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Link Columns (Gorom Deal > Settings > Footer) */}
          {footer.columns.map((col, ci) => (
            <div key={ci} className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">{tx(col.title)}</h4>
              <ul className="space-y-2 text-xs">
                {col.links.map((link, li) => (
                  <li key={li}>
                    {/^(https?:)?\/\/|^\/|^#|^mailto:|^tel:/.test(link.target) ? (
                      <a href={link.target} className="hover:text-[#F36B0B] transition-colors">
                        {tx(link.label)}
                      </a>
                    ) : (
                      <button
                        onClick={() => onSelectCategory(link.target || 'all')}
                        className="hover:text-[#F36B0B] transition-colors cursor-pointer text-left"
                      >
                        {tx(link.label)}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Subscribe */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">{tx(footer.newsletterTitle)}</h4>
            <p className="text-xs text-stone-400">{tx(footer.newsletterText)}</p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex items-center bg-stone-800 rounded-xl overflow-hidden border border-stone-700 focus-within:border-[#F36B0B]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.email_placeholder')}
                  className="w-full px-3 py-2.5 text-xs text-white bg-transparent outline-none placeholder:text-stone-500"
                  required
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="bg-[#F36B0B] hover:bg-[#de5f07] text-white p-2.5 transition-colors cursor-pointer shrink-0 disabled:opacity-60"
                  aria-label="Subscribe"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {subscribed && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('footer.subscribed_successfully')}</span>
                </div>
              )}
              {error && <p className="text-xs text-red-400">{error}</p>}
            </form>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#F36B0B] shrink-0" />
            <span>
              © {new Date().getFullYear()} {tx(footer.copyright)}
            </span>
          </div>

          {footer.bottomLinks.length > 0 && (
            <div className="flex items-center gap-4 text-stone-400 flex-wrap justify-center">
              {footer.bottomLinks.map((link, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span>·</span>}
                  <a href={link.url || '#'} className="hover:text-white">
                    {tx(link.label)}
                  </a>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
