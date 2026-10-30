import React, { useState } from 'react';
import { 
  X, 
  Server, 
  RefreshCw, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  ExternalLink,
  Flame,
  HelpCircle,
  Database,
  ArrowRight
} from 'lucide-react';
import { Product } from '../types';
import { WordPressSettings, fetchWordPressProducts } from '../services/wordpress';

interface WordPressAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WordPressSettings;
  onSaveSettings: (settings: WordPressSettings) => void;
  products: Product[];
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onBulkSync: (products: Product[]) => void;
  lang: 'bn' | 'en';
}

export const WordPressAdminModal: React.FC<WordPressAdminModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onBulkSync,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'connection' | 'products' | 'docs'>('connection');
  
  // Connection Form State
  const [siteUrl, setSiteUrl] = useState(settings.siteUrl || '');
  const [consumerKey, setConsumerKey] = useState(settings.consumerKey || '');
  const [consumerSecret, setConsumerSecret] = useState(settings.consumerSecret || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // New Product Modal State inside Headless CMS
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<'kitchen-appliances' | 'cookware' | 'gadgets' | 'audio' | 'power-charging' | 'smartwatch'>('kitchen-appliances');
  const [newProductBrand, setNewProductBrand] = useState('Vision Electronics');
  const [newProductPrice, setNewProductPrice] = useState('2450');
  const [newProductOriginalPrice, setNewProductOriginalPrice] = useState('3200');
  const [newProductDesc, setNewProductDesc] = useState('উচ্চ ক্ষমতার প্রিমিয়াম কিচেন পণ্য।');
  const [newProductIsFlash, setNewProductIsFlash] = useState(true);

  if (!isOpen) return null;

  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: WordPressSettings = {
      ...settings,
      siteUrl,
      consumerKey,
      consumerSecret,
      isConfigured: Boolean(siteUrl.trim() && consumerKey.trim()),
      lastSyncedAt: new Date().toLocaleTimeString('bn-BD'),
      mode: siteUrl.includes('demo') ? 'demo-headless' : 'live-wordpress',
    };
    onSaveSettings(updated);

    // If keys are provided, attempt live fetch
    if (updated.consumerKey && updated.consumerSecret) {
      setIsSyncing(true);
      setSyncStatus(null);
      const res = await fetchWordPressProducts(updated);
      setIsSyncing(false);
      if (res.success && res.products && res.products.length > 0) {
        onBulkSync(res.products);
        setSyncStatus({
          success: true,
          message: `সফলভাবে WordPress WooCommerce থেকে ${res.products.length}টি পণ্য সিনক্রোনাইজ হয়েছে!`,
        });
      } else {
        setSyncStatus({
          success: false,
          message: res.error || 'WordPress REST API থেকে পণ্য আনতে সমস্যা হয়েছে। বিস্তারিত যাচাই করুন।',
        });
      }
    } else {
      setSyncStatus({
        success: true,
        message: 'Headless WordPress সেটিংস সংরক্ষিত হয়েছে! (লোকাল সিঙ্ক মোড সক্রিয়)',
      });
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const price = parseFloat(newProductPrice) || 1500;
    const origPrice = parseFloat(newProductOriginalPrice) || 2000;
    const discount = origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0;

    const newProd: Product = {
      id: `wp-local-${Date.now()}`,
      name: newProductName,
      nameEn: newProductName,
      brand: newProductBrand,
      category: newProductCategory,
      categoryNameBn: newProductCategory.includes('kitchen') ? 'কিচেন অ্যাপ্লায়েন্স' : 'স্মার্ট গ্যাজেটস',
      categoryNameEn: newProductCategory.includes('kitchen') ? 'Kitchen Appliances' : 'Smart Gadgets',
      price,
      originalPrice: origPrice,
      discountPercent: discount,
      rating: 4.9,
      reviewCount: 1,
      image: newProductCategory.includes('kitchen') 
        ? '/src/assets/images/product_smart_airfryer_1793335872086.jpg' 
        : '/src/assets/images/gadget_smartwatch_tws_1793337109838.jpg',
      images: [
        newProductCategory.includes('kitchen') 
          ? '/src/assets/images/product_smart_airfryer_1793335872086.jpg' 
          : '/src/assets/images/gadget_smartwatch_tws_1793337109838.jpg',
      ],
      inStock: true,
      stockCount: 50,
      isFlashDeal: newProductIsFlash,
      soldPercent: 20,
      badge: 'নতুন আগমন',
      description: newProductDesc,
      descriptionEn: newProductDesc,
      features: [
        '১০০% খাঁটি ও আসল পণ্য গ্যারান্টি',
        '১ বছরের সরাসরি ব্র্যান্ড ওয়ারেন্টি',
        'সারাদেশে দ্রুত হোম ডেলিভারি সুবিধা',
      ],
      specifications: {
        'মডেল': 'WP-MODEL-' + Math.floor(100 + Math.random() * 900),
        'ব্র্যান্ড': newProductBrand,
        'ক্যাটাগরি': newProductCategory,
        'ওয়ারেন্টি': '১ বছরের ব্র্যান্ড ওয়ারেন্টি',
      },
      warranty: '১ বছরের অফিসিয়াল সার্ভিস ওয়ারেন্টি',
      sku: 'WP-' + Math.floor(1000 + Math.random() * 9000),
      reviews: [
        {
          id: 'rev-wp-new',
          author: 'আল-আমিন',
          rating: 5,
          date: 'আজ',
          comment: 'ওয়ার্ডপ্রেস ব্যাকএন্ড থেকে নতুন যুক্ত করা কিচেন/গ্যাজেট পণ্য!',
          verifiedPurchase: true,
          city: 'ঢাকা',
        },
      ],
    };

    onAddProduct(newProd);
    setIsAddingProduct(false);
    setNewProductName('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-[#252525] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F36B0B] text-white flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>Headless WordPress & WooCommerce ব্যাকএন্ড কন্ট্রোল</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  REST API v3 Ready
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                ওয়ার্ডপ্রেস ব্যাকএন্ড থেকে এই ফ্রন্টএন্ড স্টোরের সকল প্রোডাক্ট, দাম এবং স্টক নিয়ন্ত্রণ করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-stone-200 bg-[#FFF8F1]">
          <button
            onClick={() => setActiveTab('connection')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'connection'
                ? 'border-[#F36B0B] text-[#F36B0B]'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>WordPress API কানেকশন</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'products'
                ? 'border-[#F36B0B] text-[#F36B0B]'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>পণ্য ব্যবস্থাপনা ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'docs'
                ? 'border-[#F36B0B] text-[#F36B0B]'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>কিভাবে সংযুক্ত করবেন (গাইড)</span>
          </button>
        </div>

        {/* Modal Tab Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* TAB 1: CONNECTION CONFIG */}
          {activeTab === 'connection' && (
            <div className="space-y-6">
              <form onSubmit={handleSaveConnection} className="space-y-4">
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                    <span>WordPress Site URL (আপনার ওয়ার্ডপ্রেস সাইটের ঠিকানা) *</span>
                    <span className="text-[11px] text-stone-400 font-mono">যেমন: https://goromdeal.com</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    placeholder="https://your-wordpress-site.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl outline-none focus:bg-white focus:border-[#F36B0B]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">
                      WooCommerce Consumer Key (ck_xxxx)
                    </label>
                    <input
                      type="text"
                      value={consumerKey}
                      onChange={(e) => setConsumerKey(e.target.value)}
                      placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl outline-none font-mono focus:bg-white focus:border-[#F36B0B]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">
                      WooCommerce Consumer Secret (cs_xxxx)
                    </label>
                    <input
                      type="password"
                      value={consumerSecret}
                      onChange={(e) => setConsumerSecret(e.target.value)}
                      placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl outline-none font-mono focus:bg-white focus:border-[#F36B0B]"
                    />
                  </div>
                </div>

                {/* Status Message */}
                {syncStatus && (
                  <div className={`p-4 rounded-xl text-xs flex items-start gap-2.5 ${
                    syncStatus.success 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {syncStatus.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{syncStatus.message}</span>
                  </div>
                )}

                {/* Submit & Sync Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSyncing}
                    className="px-6 py-3 bg-[#F36B0B] hover:bg-[#de5f07] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    <span>{isSyncing ? 'ওয়ার্ডপ্রেস সিঙ্ক হচ্ছে...' : 'সেভ করুন ও WordPress থেকে সিঙ্ক করুন'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSiteUrl('https://demo-wp.goromdeal.com');
                      setConsumerKey('ck_demo_test_key_12345');
                      setConsumerSecret('cs_demo_test_secret_67890');
                    }}
                    className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    ডেমো ক্রেডেনশিয়াল পূরণ করুন
                  </button>
                </div>
              </form>

              {/* Headless Architecture Highlights */}
              <div className="bg-[#FFF8F1] p-4 rounded-2xl border border-orange-100 space-y-2 text-xs text-stone-700">
                <h4 className="font-bold text-[#252525] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#F36B0B]" />
                  <span>হেডলেস ওয়ার্ডপ্রেসের মূল সুবিধাসমূহ:</span>
                </h4>
                <ul className="space-y-1 list-disc pl-5 text-stone-600 leading-relaxed">
                  <li><strong>আল্ট্রা-ফাস্ট গতি</strong>: ফ্রন্টএন্ডে রিয়্যাক্ট ও ভিটের স্পিড, যা ট্র্যাডিশনাল ওয়ার্ডপ্রেস থিমের তুলনায় ৫ গুণ বেশি ফাস্ট লোড হয়।</li>
                  <li><strong>সহজ ব্যাকএন্ড</strong>: আপনি বা আপনার টিম привычной WooCommerce ড্যাশবোর্ড থেকে প্রোডাক্ট অ্যাড, এডিট, প্রাইস চেঞ্জ ও অর্ডার দেখতে পারবেন।</li>
                  <li><strong>API ইন্টিগ্রেশন</strong>: <code>/wp-json/wc/v3/products</code> এন্ডপয়েন্ট থেকে রিয়েল-টাইমে ডাটা নিয়ে এই সাইট রিফ্রেশ হয়।</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT (CRUD in Headless Mode) */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              
              {/* Header with Add Product button */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <h4 className="text-sm font-bold text-[#252525]">
                    বর্তমানে সাইটে লাইভ থাকা পণ্য তালিকা ({products.length}টি)
                  </h4>
                  <p className="text-xs text-stone-500">
                    ওয়ার্ডপ্রেস থেকে আসা যেকোনো পণ্যের দাম, স্টক বা ফ্ল্যাশ ডিল স্ট্যাটাস পরিচালনা করুন
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingProduct(!isAddingProduct)}
                  className="px-4 py-2 bg-[#F36B0B] hover:bg-[#de5f07] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingProduct ? 'বাতিল' : 'নতুন পণ্য যোগ করুন'}</span>
                </button>
              </div>

              {/* Add Product Inline Form */}
              {isAddingProduct && (
                <form onSubmit={handleCreateProduct} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-4 animate-in fade-in duration-150">
                  <h5 className="text-xs font-bold text-[#252525] uppercase tracking-wider">
                    ওয়ার্ডপ্রেস ব্যাকএন্ড প্রোডাক্ট সিমুলেশন ফর্ম
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700">পণ্যের নাম *</label>
                      <input
                        type="text"
                        required
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        placeholder="যেমন: ভিশন স্মার্ট কিচেন চপার"
                        className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg outline-none focus:border-[#F36B0B]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700">ক্যাটাগরি *</label>
                      <select
                        value={newProductCategory}
                        onChange={(e) => setNewProductCategory(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg outline-none focus:border-[#F36B0B]"
                      >
                        <option value="kitchen-appliances">কিচেন অ্যাপ্লায়েন্স</option>
                        <option value="cookware">কুকওয়্যার ও প্যান</option>
                        <option value="gadgets">স্মার্ট গ্যাজেটস</option>
                        <option value="audio">অডিও ও হেডফোন</option>
                        <option value="smartwatch">স্মার্টওয়াচ</option>
                        <option value="power-charging">পাওয়ার ও চার্জিং</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700">অফার মূল্য (৳) *</label>
                      <input
                        type="number"
                        required
                        value={newProductPrice}
                        onChange={(e) => setNewProductPrice(e.target.value)}
                        placeholder="2450"
                        className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg outline-none font-mono focus:border-[#F36B0B]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700">আসল মূল্য (৳)</label>
                      <input
                        type="number"
                        value={newProductOriginalPrice}
                        onChange={(e) => setNewProductOriginalPrice(e.target.value)}
                        placeholder="3200"
                        className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg outline-none font-mono focus:border-[#F36B0B]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">সংক্ষিপ্ত বিবরণ</label>
                    <input
                      type="text"
                      value={newProductDesc}
                      onChange={(e) => setNewProductDesc(e.target.value)}
                      placeholder="পণ্য সম্পর্কে মূল তথ্য দিন"
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg outline-none focus:border-[#F36B0B]"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-stone-700 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProductIsFlash}
                        onChange={(e) => setNewProductIsFlash(e.target.checked)}
                        className="rounded accent-[#F36B0B]"
                      />
                      <span>গরম ডিল (Flash Deals) এ প্রদর্শন করুন</span>
                    </label>

                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#F36B0B] text-white text-xs font-bold rounded-lg hover:bg-[#de5f07] cursor-pointer"
                    >
                      পণ্য পাবলিশ করুন
                    </button>
                  </div>
                </form>
              )}

              {/* Table of Products */}
              <div className="overflow-x-auto rounded-2xl border border-stone-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFF8F1] text-stone-700 border-b border-orange-100 font-bold">
                    <tr>
                      <th className="py-3 px-4">পণ্য</th>
                      <th className="py-3 px-3">ক্যাটাগরি</th>
                      <th className="py-3 px-3">দাম (৳)</th>
                      <th className="py-3 px-3">স্টক</th>
                      <th className="py-3 px-3">টাইপ</th>
                      <th className="py-3 px-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-contain rounded-lg border border-stone-200 bg-white p-0.5 shrink-0"
                          />
                          <div className="min-w-0 max-w-[200px]">
                            <p className="font-semibold text-stone-900 truncate" title={p.name}>{p.name}</p>
                            <span className="text-[10px] text-stone-400 font-mono">{p.sku}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-stone-600">
                          {p.categoryNameBn}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#F36B0B]">
                          ৳{p.price.toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold">
                            {p.stockCount}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {p.isFlashDeal ? (
                            <span className="text-[10px] bg-[#E93825]/10 text-[#E93825] px-2 py-0.5 rounded font-semibold">
                              গরম ডিল
                            </span>
                          ) : (
                            <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                              নরমাল
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 text-stone-400 hover:text-[#E93825] rounded hover:bg-stone-100 cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: STEP-BY-STEP WP CONNECTION GUIDE */}
          {activeTab === 'docs' && (
            <div className="space-y-6 text-xs text-stone-700 leading-relaxed max-w-3xl">
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-700" />
                  <span>WordPress WooCommerce REST API সেটআপ গাইড</span>
                </h4>
                <p className="text-blue-800">
                  আপনার ওয়ার্ডপ্রেস সাইট থেকে সরাসরি এই সাইট কন্ট্রোল করতে নিচের ৩টি সহজ ধাপ অনুসরণ করুন:
                </p>
              </div>

              <div className="space-y-4">
                
                {/* Step 1 */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                  <span className="font-bold text-sm text-[#F36B0B]">১. WooCommerce REST API কি জেনারেট করুন:</span>
                  <p className="text-stone-600">
                    আপনার WordPress ড্যাশবোর্ডে লগইন করুন &gt; <strong>WooCommerce</strong> &gt; <strong>Settings</strong> &gt; <strong>Advanced</strong> ট্যাবে যান &gt; <strong>REST API</strong> এ ক্লিক করুন &gt; <strong>Add Key</strong> বাটন প্রেস করুন।
                  </p>
                  <p className="text-stone-500 font-mono text-[11px] bg-stone-100 p-2 rounded">
                    Permissions: Read/Write সিলেক্ট করুন &gt; Generate API Key
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                  <span className="font-bold text-sm text-[#F36B0B]">২. Consumer Key ও Secret কপি করুন:</span>
                  <p className="text-stone-600">
                    জেনারেট হওয়া <code>Consumer Key</code> (যেমন: <code>ck_...</code>) এবং <code>Consumer Secret</code> (যেমন: <code>cs_...</code>) কপি করে এই মডালের "WordPress API কানেকশন" ট্যাবে পেস্ট করুন।
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                  <span className="font-bold text-sm text-[#F36B0B]">৩. CORS ও পারমালিংক নিশ্চিতকরণ:</span>
                  <p className="text-stone-600">
                    WordPress ড্যাশবোর্ডের <strong>Settings</strong> &gt; <strong>Permalinks</strong> এ গিয়ে <strong>Post name</strong> সিলেক্ট থাকতে হবে (Plain পারমালিংক কাজ করবে না)।
                  </p>
                </div>

              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-emerald-900 text-sm">তৈরি WooCommerce প্লাগইন সাপোর্ট</h5>
                  <p className="text-emerald-800 text-[11px]">
                    WordPress প্লাগইন "WPGraphQL" কিংবা ডিফল্ট WooCommerce REST API উভয়ের সাথেই এই সাইট সামঞ্জস্যপূর্ণ।
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('connection')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  কানেক্ট করুন →
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
