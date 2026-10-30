import React, { useState } from 'react';
import { X, User, Phone, CheckCircle2, ShieldCheck, ShoppingBag, LogOut } from 'lucide-react';
import { Order } from '../types';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onOpenTrackOrder: () => void;
  lang: 'bn' | 'en';
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  orders,
  onOpenTrackOrder,
  lang,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [userName, setUserName] = useState('আল-আমিন হোসেন (Al-Amin Hossain)');

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length >= 11) {
      setOtpStep(true);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '1234' || otp.length === 4) {
      setIsLoggedIn(true);
      setOtpStep(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#FFF8F1] border-b border-orange-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#F36B0B]" />
            <h3 className="text-base font-bold text-[#252525]">
              {isLoggedIn 
                ? (lang === 'bn' ? 'আমার একাউন্ট ড্যাশবোর্ড' : 'My Account Dashboard') 
                : (lang === 'bn' ? 'সাইন ইন / রেজিস্ট্রেশন' : 'Sign In / Register')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isLoggedIn ? (
            /* Logged in Profile state */
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="w-12 h-12 rounded-full bg-[#F36B0B] text-white flex items-center justify-center font-bold text-lg">
                  {userName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#252525]">{userName}</h4>
                  <p className="text-xs text-stone-500 font-mono">{phoneNumber || '01712-345678'}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    ভেরিফাইড মেম্বার
                  </span>
                </div>
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="p-2 text-stone-400 hover:text-[#E93825] cursor-pointer"
                  title="লগ আউট"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              {/* Order history */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-[#F36B0B]" />
                    <span>{lang === 'bn' ? 'আমার সাম্প্রতিক অর্ডারসমূহ' : 'My Recent Orders'}</span>
                  </h5>
                  <button
                    onClick={() => { onClose(); onOpenTrackOrder(); }}
                    className="text-xs text-[#F36B0B] hover:underline font-semibold cursor-pointer"
                  >
                    {lang === 'bn' ? 'অর্ডার ট্র্যাক' : 'Track'}
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-6 text-xs text-stone-400 bg-stone-50 rounded-xl">
                    {lang === 'bn' ? 'এখনো কোনো অর্ডার সম্পন্ন হয়নি।' : 'No orders yet.'}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {orders.map((o) => (
                      <div key={o.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold font-mono text-[#F36B0B]">{o.id}</p>
                          <p className="text-[11px] text-stone-500">{o.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-stone-900 font-mono">৳{o.total.toLocaleString()}</p>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Login with Phone Number (Bangladeshi Flow) */
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold text-[#252525]">
                  {lang === 'bn' ? 'গরম ডিলে স্বাগতম!' : 'Welcome to Gorom Deal!'}
                </h4>
                <p className="text-xs text-stone-500">
                  {lang === 'bn' 
                    ? 'আপনার মোবাইল নম্বর দিয়ে দ্রুত লগইন বা একাউন্ট তৈরি করুন' 
                    : 'Login or register quickly using your phone number'}
                </p>
              </div>

              {!otpStep ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{lang === 'bn' ? 'মোবাইল নাম্বার' : 'Mobile Number'}</span>
                    </label>
                    <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden focus-within:border-[#F36B0B]">
                      <span className="px-3 py-2.5 bg-stone-100 text-xs font-semibold text-stone-600 border-r border-stone-200">
                        +88
                      </span>
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
                    className="w-full py-3 bg-[#F36B0B] hover:bg-[#de5f07] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'ওটিপি (OTP) কোড পাঠান' : 'Send OTP Code'}
                  </button>

                  <p className="text-[11px] text-center text-stone-400">
                    {lang === 'bn' ? 'ডেমো টেস্টিং এর জন্য যেকোনো নম্বর দিন' : 'Enter any phone number for demo test'}
                  </p>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1 text-center">
                    <label className="text-xs font-semibold text-stone-700">
                      {lang === 'bn' ? '৪ ডিজিটের ওটিপি দিন (যেকোনো ৪ সংখ্যা বা 1234)' : 'Enter 4-digit OTP (e.g. 1234)'}
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="1234"
                      className="w-36 mx-auto px-4 py-2.5 text-center text-lg font-mono tracking-widest bg-stone-50 border border-stone-300 rounded-xl outline-none focus:border-[#F36B0B] focus:bg-white"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#F36B0B] hover:bg-[#de5f07] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'ভেরিফাই ও লগইন' : 'Verify & Sign In'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setOtpStep(false)}
                    className="w-full text-xs text-stone-500 hover:text-stone-800 text-center cursor-pointer"
                  >
                    {lang === 'bn' ? 'নম্বর পরিবর্তন করুন' : 'Change Phone Number'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
