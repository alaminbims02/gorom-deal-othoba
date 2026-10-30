import React, { useState } from 'react';
import { Flame, Mail, Send, CheckCircle2, Phone, MapPin, Shield } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (id: string) => void;
  lang: 'bn' | 'en';
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, lang }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#252525] text-stone-300 pt-12 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-stone-700/80">
          
          {/* Col 1 & 2: Brand Information */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E93825] to-[#F36B0B] text-white">
                <Flame className="w-5 h-5" />
              </div>
              <div className="text-xl font-bold text-white tracking-tight">
                গরম<span className="text-[#F36B0B]">ডিল</span>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              {lang === 'bn'
                ? 'বাংলাদেশের নির্ভরযোগ্য কিচেন অ্যাপ্লায়েন্স ও হাই-টেক গ্যাজেটস স্টোর। ভিশন, আরএফএল এবং শীর্ষ ব্র্যান্ডের আসল পণ্য সরাসরি ব্র্যান্ড ওয়ারেন্টি সহ পৌঁছে দিচ্ছি আপনার ঠিকানায়।'
                : 'Bangladesh’s premier destination for genuine kitchen appliances, cookware and smart gadgets with official warranty and nationwide cash on delivery.'}
            </p>

            <div className="space-y-2 text-xs text-stone-400 pt-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F36B0B] shrink-0 mt-0.5" />
                <span>প্রাণ-আরএফএল সেন্টার, ১০৫ প্রগতি সরণি, মধ্য বাড্ডা, ঢাকা-১২১২</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F36B0B] shrink-0" />
                <span>হটলাইন: ০৯৬১৩-৭৩৭৭২৬ (সকাল ৯টা - রাত ১০টা)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F36B0B] shrink-0" />
                <span>ইমেইল: support@goromdeal.com</span>
              </div>
            </div>
          </div>

          {/* Col 3: Kitchen & Cookware Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {lang === 'bn' ? 'কিচেন আইটেমস' : 'Kitchen Items'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onSelectCategory('kitchen-appliances')}
                  className="hover:text-[#F36B0B] transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'ডিজিটাল এয়ার ফ্রায়ার' : 'Digital Air Fryers'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('kitchen-appliances')}
                  className="hover:text-[#F36B0B] transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'হেভি ডিউটি ব্লেন্ডার ও মিক্সার' : 'Blenders & Grinders'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('cookware')}
                  className="hover:text-[#F36B0B] transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'গ্রানাইট মার্বেল কুকওয়্যার' : 'Marble Cookware Sets'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('kitchen-appliances')}
                  className="hover:text-[#F36B0B] transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'স্টেইনলেস স্টিল কেটলি' : 'Electric Kettles'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('cookware')}
                  className="hover:text-[#F36B0B] transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'থার্মাস ফ্লাস্ক ও বোতল' : 'Thermos & Flasks'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Gadgets Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {lang === 'bn' ? 'স্মার্ট গ্যাজেটস' : 'Smart Gadgets'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onSelectCategory('smartwatch')}
                  className="hover:text-[#F36B0B] transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'এমোলেড ব্লুটুথ স্মার্টওয়াচ' : 'AMOLED Smartwatches'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('audio')}
                  className="hover:text-[#F36B0B] transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'এএনসি ওয়্যারলেস হেডফোন' : 'ANC Headphones'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('audio')}
                  className="hover:text-[#F36B0B] transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'টিডব্লিউএস ব্লুটুথ ইয়ারবাডস' : 'TWS Wireless Earbuds'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('power-charging')}
                  className="hover:text-[#F36B0B] transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? '৬৫ ওয়াট ল্যাপটপ পাওয়ার ব্যাংক' : '65W Fast Power Banks'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Newsletter Subscribe */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {lang === 'bn' ? 'নিউজলেটার ও অফার' : 'Offers & Vouchers'}
            </h4>
            <p className="text-xs text-stone-400">
              {lang === 'bn' ? 'নতুন কিচেন ও গ্যাজেটসের এক্সক্লুসিভ ভাউচার পেতে ইমেইল সাবস্ক্রাইব করুন।' : 'Subscribe to receive secret voucher codes and flash deal alerts.'}
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex items-center bg-stone-800 rounded-xl overflow-hidden border border-stone-700 focus-within:border-[#F36B0B]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="আপনার ইমেইল দিন..."
                  className="w-full px-3 py-2.5 text-xs text-white bg-transparent outline-none placeholder:text-stone-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#F36B0B] hover:bg-[#de5f07] text-white p-2.5 transition-colors cursor-pointer shrink-0"
                  aria-label="Subscribe"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {subscribed && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'ধন্যবাদ! সাবস্ক্রিপশন সম্পন্ন হয়েছে।' : 'Subscribed successfully!'}</span>
                </div>
              )}
            </form>

            <div className="pt-2">
              <p className="text-[11px] text-stone-400 mb-1.5">{lang === 'bn' ? 'পেমেন্ট মাধ্যমসমূহ:' : 'Accepted Payments:'}</p>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 bg-[#E2136E] text-white rounded font-bold text-[10px]">bKash</span>
                <span className="px-2 py-0.5 bg-[#F7941D] text-white rounded font-bold text-[10px]">Nagad</span>
                <span className="px-2 py-0.5 bg-[#8C3494] text-white rounded font-bold text-[10px]">Rocket</span>
                <span className="px-2 py-0.5 bg-blue-700 text-white rounded font-bold text-[10px]">VISA</span>
                <span className="px-2 py-0.5 bg-red-600 text-white rounded font-bold text-[10px]">Mastercard</span>
                <span className="px-2 py-0.5 bg-stone-700 text-stone-200 rounded font-bold text-[10px]">COD</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#F36B0B]" />
            <span>© {new Date().getFullYear()} গরম ডিল - Gorom Deal | কিচেন ও গ্যাজেটসের নির্ভরযোগ্য অনলাইন শপ।</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <span className="hover:text-white cursor-pointer">প্রাইভেসি পলিসি</span>
            <span>·</span>
            <span className="hover:text-white cursor-pointer">রিটার্ন ও রিফান্ড</span>
            <span>·</span>
            <span className="hover:text-white cursor-pointer">সাইটম্যাপ</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
