import React from 'react';
import { useSite } from '../context/SiteContext';
import { DynamicIcon } from './DynamicIcon';

export const TrustFeaturesBar: React.FC = () => {
  const { tx, settings } = useSite();
  const features = settings.trustFeatures;
  if (features.length === 0) return null;

  return (
    <div className="bg-[#FFF8F1] border-y border-orange-100/80 py-6 sm:py-8 my-4 sm:my-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {features.map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2.5 sm:gap-3.5 group">
              <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-orange-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <DynamicIcon name={item.icon} className="w-7 h-7 text-[#F36B0B]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-[#252525]">
                  {tx(item.title)}
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {tx(item.text)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
