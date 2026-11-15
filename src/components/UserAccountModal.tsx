import React, { useEffect, useState } from 'react';
import { useSite } from '../context/SiteContext';
import { X, User, Phone, ShieldCheck, ShoppingBag, LogOut, Loader2 } from 'lucide-react';
import { Order } from '../types';
import { Customer, getMe, getMyOrders, IS_LIVE, logout, sendOtp, verifyOtp } from '../services/api';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Orders placed from this browser (used in demo mode / before login). */
  orders: Order[];
  onOpenTrackOrder: () => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({ isOpen, onClose, orders, onOpenTrackOrder }) => {
  const site = useSite();
  const { t, tx, date, settings } = site;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [serverOrders, setServerOrders] = useState<Order[] | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [demoCode, setDemoCode] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Restore session when the modal opens.
  useEffect(() => {
    if (!isOpen || customer) return;
    getMe().then((me) => me && setCustomer(me));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Load the customer's orders from WordPress once logged in.
  useEffect(() => {
    if (!isOpen || !customer || !IS_LIVE) return;
    getMyOrders(site)
      .then(setServerOrders)
      .catch(() => setServerOrders(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, customer]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.replace(/\D/g, '').length < 11) return;
    setBusy(true);
    setError('');
    try {
      const res = await sendOtp(phoneNumber);
      setDemoCode(res.demoCode);
      setOtpStep(true);
    } catch (err: any) {
      setError(err?.message || t('common.error_try_again'));
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const me = await verifyOtp(phoneNumber, otp);
      setCustomer(me);
      setOtpStep(false);
      setOtp('');
    } catch (err: any) {
      setError(err?.message || t('common.error_try_again'));
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCustomer(null);
    setServerOrders(null);
  };

  const shownOrders = serverOrders ?? orders;
  const displayName = customer?.name || t('userAccountModal.default_name');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/55 flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#FFF8F1] border-b border-orange-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#F36B0B]" />
            <h3 className="text-sm sm:text-base font-bold text-[#252525]">
              {customer ? t('userAccountModal.my_account_dashboard') : t('userAccountModal.sign_in_register')}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {customer ? (
            /* Logged in Profile state */
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="w-12 h-12 rounded-full bg-[#F36B0B] text-white flex items-center justify-center font-bold text-lg">
                  {displayName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-[#252525] truncate">{displayName}</h4>
                  <p className="text-xs text-stone-500">{customer.phone}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t('userAccountModal.verified_member')}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-stone-400 hover:text-[#E93825] cursor-pointer"
                  title={t('userAccountModal.logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              {/* Order history */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-[#F36B0B]" />
                    <span>{t('userAccountModal.my_recent_orders')}</span>
                  </h5>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenTrackOrder();
                    }}
                    className="text-xs text-[#F36B0B] hover:underline font-semibold cursor-pointer"
                  >
                    {t('userAccountModal.track')}
                  </button>
                </div>

                {shownOrders.length === 0 ? (
                  <div className="text-center py-6 text-xs text-stone-400 bg-stone-50 rounded-xl">
                    {t('userAccountModal.no_orders_yet')}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {shownOrders.map((o) => (
                      <div key={o.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-[#F36B0B]">{o.id}</p>
                          <p className="text-[11px] text-stone-500">{date(o.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-stone-900 font-mono tabular-nums">৳{o.total.toLocaleString()}</p>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">
                            {tx(settings.tracking.statusLabels[o.status]) || o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Login with Phone Number + OTP */
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold text-[#252525]">{t('userAccountModal.welcome_to_gorom_deal')}</h4>
                <p className="text-xs text-stone-500">{t('userAccountModal.login_or_register_quickly_using_your')}</p>
              </div>

              {!otpStep ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{t('userAccountModal.mobile_number')}</span>
                    </label>
                    <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden focus-within:border-[#F36B0B]">
                      <span className="px-3 py-2.5 bg-stone-100 text-xs font-semibold text-stone-600 border-r border-stone-200">+88</span>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full px-3 py-2.5 text-xs bg-white outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-3 bg-[#F36B0B] hover:bg-[#de5f07] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                    {t('userAccountModal.send_otp_code')}
                  </button>

                  <p className="text-[11px] text-center text-stone-400">{t('userAccountModal.enter_any_phone_number_for_demo')}</p>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1 text-center">
                    <label className="text-xs font-semibold text-stone-700 block">
                      {t('userAccountModal.enter_4_digit_otp_e_g', [phoneNumber])}
                    </label>
                    {demoCode && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 inline-block">
                        {t('userAccountModal.demo_otp', [demoCode])}
                      </p>
                    )}
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="block w-36 mx-auto mt-2 px-4 py-2.5 text-center text-lg tracking-widest bg-stone-50 border border-stone-300 rounded-xl outline-none focus:border-[#F36B0B] focus:bg-white"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={busy || otp.length !== 4}
                    className="w-full py-3 bg-[#F36B0B] hover:bg-[#de5f07] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                    {t('userAccountModal.verify_sign_in')}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep(false);
                      setError('');
                    }}
                    className="w-full text-xs text-stone-500 hover:text-stone-800 text-center cursor-pointer"
                  >
                    {t('userAccountModal.change_phone_number')}
                  </button>
                </form>
              )}

              {error && <p className="text-xs text-center text-[#E93825]">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
