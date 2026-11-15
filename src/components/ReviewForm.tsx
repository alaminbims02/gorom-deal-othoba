import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { submitReview } from '../services/api';

/** Posts a customer review to WordPress (held for moderation under Comments). */
export const ReviewForm: React.FC<{ productId: string }> = ({ productId }) => {
  const { t } = useSite();
  const [author, setAuthor] = useState('');
  const [city, setCity] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) return;
    setBusy(true);
    setError('');
    try {
      await submitReview(productId, { author: author.trim(), city: city.trim(), rating, comment: comment.trim() });
      setDone(true);
      setAuthor('');
      setCity('');
      setComment('');
    } catch (err: any) {
      setError(err?.message || t('common.error_try_again'));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold">
        {t('productDetailPage.review_thanks')}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="p-4 rounded-xl border border-stone-200 bg-white space-y-3">
      <h4 className="text-sm font-bold text-stone-800">{t('productDetailPage.write_review')}</h4>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star`} className="cursor-pointer">
            <Star className={`w-5 h-5 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          maxLength={60}
          placeholder={t('productDetailPage.review_name')}
          className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg outline-none focus:border-[#F36B0B]"
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          maxLength={60}
          placeholder={t('productDetailPage.review_city')}
          className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg outline-none focus:border-[#F36B0B]"
        />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
        rows={3}
        maxLength={1000}
        placeholder={t('productDetailPage.review_comment')}
        className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg outline-none focus:border-[#F36B0B] resize-none"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="px-5 py-2 bg-[#F36B0B] hover:bg-[#de5f07] text-white text-xs sm:text-sm font-bold rounded-lg cursor-pointer disabled:opacity-60"
      >
        {busy ? t('common.loading') : t('productDetailPage.review_submit')}
      </button>
    </form>
  );
};
