import type { Metadata } from 'next';
import { defaultLang, getAllProducts, getCategories, getHome, getSettings, pick, seoTitle } from '@/lib/api';
import { slim } from '@/lib/product';
import { HeroBanner } from '@/components/HeroBanner';
import { CategoryProducts, CategoryStrip, FeaturedTabs, FlashDeals, PromoBanner, TrustBar } from '@/components/HomeBlocks';
import { EmptyState } from '@/components/EmptyState';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const lang = defaultLang(s);
  return { title: { absolute: pick(s.seo?.default_title, lang) || pick(s.general?.site_name, lang) || seoTitle(s, 'Home') }, alternates: { canonical: '/' } };
}

export default async function HomePage() {
  const [settings, home, categories, all] = await Promise.all([getSettings(), getHome(), getCategories(), getAllProducts()]);

  if (!home && !all.length) return <EmptyState />;

  const products = all.map(slim);
  const sections = home?.sections || [];
  const flash = products.filter((p) => home?.flash_ids.includes(p.id));

  return (
    <>
      {sections.map((sec) => {
        const key = `${sec.type}-${sec.index}`;
        switch (sec.type) {
          case 'hero':
            return <HeroBanner key={key} slides={settings.hero?.slides || []} points={settings.hero?.points || []} autoplay={Number(settings.hero?.autoplay) || 0} />;
          case 'categories':
            return <CategoryStrip key={key} categories={categories.slice(0, sec.limit)} title={sec.title} />;
          case 'flash_deals':
            return <FlashDeals key={key} products={flash} endsAt={home?.flash_ends_at || ''} title={sec.title} limit={sec.limit} viewAll={sec.view_all || undefined} />;
          case 'promo': {
            const banners: never[] = settings.promo?.banners || [];
            const list = sec.banner_index > 0 ? banners.slice(sec.banner_index - 1, sec.banner_index) : banners;
            return <PromoBanner key={key} banners={list} />;
          }
          case 'featured':
            return <FeaturedTabs key={key} products={products} tabs={home?.featured_tabs || []} title={sec.title} limit={sec.limit} viewAll={sec.view_all || undefined} />;
          case 'category_products':
            return <CategoryProducts key={key} products={products.filter((p) => p.categorySlug === sec.category)} title={sec.title} slug={sec.category} limit={sec.limit} />;
          case 'trust':
            return <TrustBar key={key} features={settings.trust?.features || []} />;
          default:
            return null;
        }
      })}
    </>
  );
}
