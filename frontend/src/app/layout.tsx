import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Hind_Siliguri, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { defaultLang, getCategories, getMenu, getSettings, pick } from '@/lib/api';
import { siteUrl } from '@/lib/env';
import { isHex } from '@/lib/sanitize';
import { SiteProvider } from '@/components/SiteProvider';
import { StoreHydrator } from '@/components/StoreHydrator';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const hind = Hind_Siliguri({ subsets: ['bengali', 'latin'], weight: ['400', '500', '600', '700'], variable: '--font-hind', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const lang = defaultLang(s);
  const title = pick(s.seo?.default_title, lang) || pick(s.general?.site_name, lang) || 'Store';
  const desc = pick(s.seo?.default_desc, lang);
  const og = s.seo?.og_image || s.general?.logo || undefined;
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: s.seo?.title_template || '%s' },
    description: desc || undefined,
    keywords: s.seo?.keywords || undefined,
    robots: s.seo?.noindex ? { index: false, follow: false } : undefined,
    icons: s.general?.favicon ? { icon: s.general.favicon } : undefined,
    openGraph: { type: 'website', siteName: pick(s.general?.site_name, lang) || undefined, title, description: desc || undefined, images: og ? [og] : undefined },
    twitter: { card: 'summary_large_image', site: s.seo?.twitter_handle || undefined },
  };
}

export const viewport: Viewport = { themeColor: '#F36B0B', width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, menu, categories] = await Promise.all([getSettings(), getMenu(), getCategories()]);
  const lang = defaultLang(settings);
  const g = settings.general || {};
  const css = [
    isHex(g.color_brand) && `--gd-brand:${g.color_brand}`,
    isHex(g.color_accent) && `--gd-accent:${g.color_accent}`,
    isHex(g.color_ink) && `--gd-ink:${g.color_ink}`,
    isHex(g.color_cream) && `--gd-cream:${g.color_cream}`,
    isHex(g.color_mist) && `--gd-mist:${g.color_mist}`,
  ].filter(Boolean).join(';');

  const t = settings.tracking || {};
  const ga4 = /^G-[A-Z0-9]+$/i.test(t.ga4 || '') ? t.ga4 : '';
  const gtm = /^GTM-[A-Z0-9]+$/i.test(t.gtm || '') ? t.gtm : '';
  const pixel = /^\d{6,20}$/.test(t.fb_pixel || '') ? t.fb_pixel : '';

  return (
    <html lang={lang} className={`${hind.variable} ${jakarta.variable}`}>
      <head>{css && <style dangerouslySetInnerHTML={{ __html: `:root{${css}}` }} />}</head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <SiteProvider settings={settings} menu={menu} categories={categories} initialLang={lang}>
          <StoreHydrator />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SiteProvider>

        {gtm && (
          <Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}</Script>
        )}
        {ga4 && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');`}</Script>
          </>
        )}
        {pixel && (
          <Script id="fb-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}</Script>
        )}
      </body>
    </html>
  );
}
