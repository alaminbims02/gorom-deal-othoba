import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SiteProvider } from './context/SiteContext';
import { fetchSiteData, getCachedData, IS_LIVE } from './services/api';
import type { Lang, SiteData } from './types';

const LANG_KEY = 'goromdeal_lang';

function readLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'bn';
  } catch {
    return 'bn';
  }
}

function Root() {
  // Show cached content instantly (stale-while-revalidate), then refresh from WordPress.
  const [data, setData] = useState<SiteData | null>(() => getCachedData());
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>(readLang);

  const load = useCallback(() => {
    setError(null);
    fetchSiteData()
      .then(setData)
      .catch((e: Error) => setError(e.message || 'Failed to load'));
  }, []);

  useEffect(load, [load]);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-[#252525] p-6">
        {error ? (
          <div className="text-center space-y-3 max-w-sm">
            <p className="text-sm font-semibold">দুঃখিত, সার্ভারের সাথে সংযোগ করা যায়নি।</p>
            <p className="text-xs text-stone-500">Could not reach the store server. ({error})</p>
            <button
              onClick={load}
              className="px-5 py-2 bg-[#F36B0B] text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              আবার চেষ্টা করুন / Retry
            </button>
          </div>
        ) : (
          <div className="w-10 h-10 border-4 border-orange-200 border-t-[#F36B0B] rounded-full animate-spin" aria-label="Loading" />
        )}
      </div>
    );
  }

  return (
    <SiteProvider data={data} lang={lang}>
      <App onToggleLang={() => setLang((l) => (l === 'bn' ? 'en' : 'bn'))} />
    </SiteProvider>
  );
}

if (!IS_LIVE) {
  // eslint-disable-next-line no-console
  console.info('[Gorom Deal] VITE_WP_API_URL is not set, running in demo mode with bundled seed data.');
}

createRoot(document.getElementById('root')!).render(<Root />);
