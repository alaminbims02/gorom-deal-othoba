import React, { useEffect, useState } from 'react';
import { useSite } from '../context/SiteContext';
import { X, Search, Truck, Phone, Loader2 } from 'lucide-react';
import { Order } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { trackOrder } from '../services/api';

interface OrderTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentOrders: Order[];
}

export const OrderTrackModal: React.FC<OrderTrackModalProps> = ({ isOpen, onClose, recentOrders }) => {
  const site = useSite();
  const { lang, t, tx, settings } = site;
  const [trackInput, setTrackInput] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runSearch = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setNotFound(false);
    try {
      const found = await trackOrder(query, site, recentOrders);
      setSearchedOrder(found);
      setNotFound(!found);
    } catch (err: any) {
      setError(err?.message || t('common.error_try_again'));
    } finally {
      setLoading(false);
    }
  };

  // When opened, pre-fill with the customer's latest order and fetch its live status.
  useEffect(() => {
    if (isOpen && recentOrders[0]) {
      setTrackInput(recentOrders[0].id);
      runSearch(recentOrders[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(trackInput);
  };

  const steps = settings.tracking.steps;
  const currentIdx = searchedOrder ? steps.findIndex((s) => s.status === searchedOrder.status) : -1;
  const isCancelled = searchedOrder?.status === 'cancelled';
  const statusLabel = searchedOrder ? tx(settings.tracking.statusLabels[searchedOrder.status]) || searchedOrder.status : '';

  const stepTime = (status: string) => {
    const entry = searchedOrder?.timeline?.find((e) => e.status === status);
    if (!entry) return '';
    const d = new Date(entry.date);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/55 flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#FFF8F1] border-b border-orange-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#F36B0B]" />
            <h3 className="text-sm sm:text-base font-bold text-[#252525]">{t('orderTrackModal.order_tracking')}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Tracking Input Form */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 block">
              {t('orderTrackModal.enter_order_id_or_mobile_number')}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                  placeholder={t('orderTrackModal.placeholder')}
                  className="w-full min-w-0 pl-9 pr-3 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl outline-none focus:bg-white focus:border-[#F36B0B]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 sm:px-5 py-2.5 bg-[#F36B0B] hover:bg-[#de5f07] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 disabled:opacity-60 flex items-center gap-1.5"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {t('orderTrackModal.track')}
              </button>
            </div>
            {notFound && <p className="text-xs text-[#E93825]">{t('orderTrackModal.order_not_found_please_check_your')}</p>}
            {error && <p className="text-xs text-[#E93825]">{error}</p>}
          </form>

          {/* Tracking Result Progression */}
          {searchedOrder && !loading && (
            <div className="bg-stone-50 rounded-xl p-4 sm:p-5 border border-stone-200/80 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3 text-xs">
                <div>
                  <span className="text-stone-500">{t('orderTrackModal.order_id')}</span>{' '}
                  <span className="font-bold text-[#F36B0B]">{searchedOrder.id}</span>
                </div>
                <div className={`font-medium ${isCancelled ? 'text-[#E93825]' : 'text-stone-600'}`}>
                  {t('orderTrackModal.status_in_transit', [statusLabel])}
                </div>
              </div>

              {/* Stepper Timeline (steps managed in Settings > Order Tracking) */}
              {!isCancelled && (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                  {steps.map((st, i) => {
                    const done = currentIdx >= i;
                    return (
                      <div key={st.status} className="relative flex items-start justify-between gap-2">
                        <div
                          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${
                            done ? 'bg-[#F36B0B] text-white' : 'bg-stone-300 text-stone-500'
                          }`}
                        >
                          <DynamicIcon name={st.icon} className="w-3 h-3" />
                        </div>

                        <div className="pl-2">
                          <p className={`text-xs font-bold leading-none ${done ? 'text-stone-900' : 'text-stone-400'}`}>{tx(st.title)}</p>
                          <p className="text-[11px] text-stone-400 mt-1">
                            {done ? t('orderTrackModal.completed') : t('orderTrackModal.pending')}
                          </p>
                        </div>

                        <span className="text-[11px] text-stone-400 text-right">{stepTime(st.status)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Courier / Hotline */}
              <div className="pt-3 border-t border-stone-200 text-xs text-stone-600 flex items-center justify-between gap-2">
                <span>{t('orderTrackModal.courier_gorom_deal_express', [tx(settings.tracking.courier)])}</span>
                <a href={`tel:${settings.contact.phone}`} className="font-semibold text-[#F36B0B] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{tx(settings.contact.phoneDisplay) || settings.contact.phone}</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
