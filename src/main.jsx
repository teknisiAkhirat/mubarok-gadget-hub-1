// Mubarok Gadget Hub - Smartphone Service & Spare Part Catalog
import React from 'react';
import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import Admin from './admin.jsx';
import { getCatalog, createInquiry } from './lib/api.js';

// Mock data
const CATEGORIES = [
  { id: 'lcd', name: 'LCD / Display', icon: '📱', desc: 'LCD, AMOLED, touchscreen' },
  { id: 'baterai', name: 'Baterai', icon: '🔋', desc: 'Baterai original & compatible' },
  { id: 'kamera', name: 'Kamera', icon: '📷', desc: 'Modul kamera depan & belakang' },
  { id: 'charging', name: 'Charging Port', icon: '⚡', desc: 'Konektor charger, flex charging' },
  { id: 'casing', name: 'Casing & Frame', icon: '🔲', desc: 'Back cover, middle frame' },
  { id: 'ic', name: 'IC & Board', icon: '🔧', desc: 'IC power, mainboard' },
  { id: 'flex', name: 'Flex Cable', icon: '🔌', desc: 'Flex kamera, tombol, sensor' },
  { id: 'audio', name: 'Speaker & Mic', icon: '🔊', desc: 'Speaker, earpiece, mikrofon' },
  { id: 'konektor', name: 'Konektor', icon: '🔗', desc: 'Konektor fleksibel & adapter' },
  { id: 'vibrator', name: 'Vibrator', icon: '📳', desc: 'Motor getar / vibrator' },
];

const PRODUCTS = [
  {
    id: 'p001', name: 'LCD iPhone 11 Pro Max Original', slug: 'lcd-iphone-11-pro-max-ori',
    categoryId: 'lcd', brand: 'Apple', model: 'iPhone 11 Pro Max',
    partType: 'LCD Display Assembly', condition: 'original', grade: 'A+',
    statusTest: 'Perfect', compatibility: 'iPhone 11 Pro Max only',
    price: 850000, stock: 3, warranty: '30 hari',
    description: 'LCD iPhone 11 Pro Max original pull out. Kondisi sempurna, tidak ada dead pixel, touch responsif.',
    images: ['https://placehold.co/600x600/1a1a2e/e94560?text=LCD+iPhone+11+Pro+Max'],
    tags: ['lcd', 'iphone', '11 pro max', 'original'],
  },
  {
    id: 'p002', name: 'Baterai Samsung Galaxy S21 Ultra', slug: 'baterai-samsung-s21-ultra',
    categoryId: 'baterai', brand: 'Samsung', model: 'Galaxy S21 Ultra',
    partType: 'Battery', condition: 'original', grade: 'A',
    statusTest: 'Health 92%', compatibility: 'Galaxy S21 Ultra only',
    price: 285000, stock: 8, warranty: '14 hari',
    description: 'Baterai original Samsung Galaxy S21 Ultra copotan. Health 92%, cycle count rendah.',
    images: ['https://placehold.co/600x600/1a1a2e/0f3460?text=Baterai+S21+Ultra'],
    tags: ['baterai', 'samsung', 's21 ultra', 'original'],
  },
  {
    id: 'p003', name: 'Kamera Belakang Xiaomi Mi 11', slug: 'kamera-xiaomi-mi11-belakang',
    categoryId: 'kamera', brand: 'Xiaomi', model: 'Mi 11',
    partType: 'Rear Camera Module', condition: 'original', grade: 'A',
    statusTest: 'Fokus OK, no blur', compatibility: 'Mi 11 only',
    price: 450000, stock: 2, warranty: '30 hari',
    description: 'Modul kamera belakang Xiaomi Mi 11 original. Fungsi autofocus normal, gambar jernih.',
    images: ['https://placehold.co/600x600/1a1a2e/533483?text=Kamera+Mi+11'],
    tags: ['kamera', 'xiaomi', 'mi 11', 'belakang'],
  },
  {
    id: 'p004', name: 'Flex Cable Charging Oppo Reno 6', slug: 'flex-charging-oppo-reno6',
    categoryId: 'charging', brand: 'Oppo', model: 'Reno 6',
    partType: 'Charging Flex Cable', condition: 'original', grade: 'B+',
    statusTest: 'Charging OK, data OK', compatibility: 'Reno 6 only',
    price: 95000, stock: 15, warranty: '7 hari',
    description: 'Flex cable charging Oppo Reno 6 copotan original. Jalur charging dan transfer data normal.',
    images: ['https://placehold.co/600x600/1a1a2e/e94560?text=Flex+Charging+Reno6'],
    tags: ['charging', 'oppo', 'reno 6', 'flex'],
  },
  {
    id: 'p005', name: 'Back Cover Vivo Y20', slug: 'back-cover-vivo-y20',
    categoryId: 'casing', brand: 'Vivo', model: 'Y20',
    partType: 'Back Cover Housing', condition: 'compatible', grade: 'A',
    statusTest: 'Perfect fit, no gap', compatibility: 'Vivo Y20 only',
    price: 75000, stock: 12, warranty: '7 hari',
    description: 'Back cover housing Vivo Y20 compatible. Presisi pas, material premium, tersedia beberapa warna.',
    images: ['https://placehold.co/600x600/1a1a2e/0f3460?text=Back+Cover+Vivo+Y20'],
    tags: ['casing', 'vivo', 'y20', 'back cover'],
  },
  {
    id: 'p006', name: 'IC Power Manager Realme 8', slug: 'ic-power-realme-8',
    categoryId: 'ic', brand: 'Realme', model: '8',
    partType: 'Power Management IC', condition: 'original', grade: 'A',
    statusTest: 'Power delivery OK', compatibility: 'Realme 8 only',
    price: 175000, stock: 5, warranty: '14 hari',
    description: 'IC Power Manager Realme 8 original. Mengatasi masalah charging lambat, battery drain, atau mati total IC.',
    images: ['https://placehold.co/600x600/1a1a2e/533483?text=IC+Power+Realme+8'],
    tags: ['ic', 'realme', '8', 'power'],
  },
  {
    id: 'p007', name: 'Flex Cable Kamera Samsung A52', slug: 'flex-kamera-samsung-a52',
    categoryId: 'flex', brand: 'Samsung', model: 'Galaxy A52',
    partType: 'Camera Flex Cable', condition: 'original', grade: 'A',
    statusTest: 'Autofocus OK, no error', compatibility: 'A52 only',
    price: 125000, stock: 6, warranty: '14 hari',
    description: 'Flex cable kamera Samsung Galaxy A52. Mengatasi error kamera tidak terdeteksi atau blur.',
    images: ['https://placehold.co/600x600/1a1a2e/e94560?text=Flex+Kamera+A52'],
    tags: ['flex', 'samsung', 'a52', 'kamera'],
  },
  {
    id: 'p008', name: 'Speaker Redmi Note 10 Pro', slug: 'speaker-redmi-note10pro',
    categoryId: 'audio', brand: 'Xiaomi', model: 'Redmi Note 10 Pro',
    partType: 'Loud Speaker', condition: 'original', grade: 'A',
    statusTest: 'Sound clear, no distortion', compatibility: 'Note 10 Pro only',
    price: 65000, stock: 20, warranty: '7 hari',
    description: 'Speaker loud speaker Redmi Note 10 Pro original copotan. Suara jernih, bass lumayan, tidak pecah.',
    images: ['https://placehold.co/600x600/1a1a2e/0f3460?text=Speaker+Note10Pro'],
    tags: ['speaker', 'xiaomi', 'redmi', 'note 10 pro'],
  },
  {
    id: 'p009', name: 'Fingerprint Flex Oppo A93', slug: 'fingerprint-flex-oppo-a93',
    categoryId: 'konektor', brand: 'Oppo', model: 'A93',
    partType: 'Fingerprint Flex Cable', condition: 'original', grade: 'A',
    statusTest: 'Unlock < 1 sec', compatibility: 'A93 only',
    price: 110000, stock: 7, warranty: '14 hari',
    description: 'Flex cable fingerprint Oppo A93 original. Sensitif, unlock cepat, tidak error.',
    images: ['https://placehold.co/600x600/1a1a2e/533483?text=Fingerprint+A93'],
    tags: ['fingerprint', 'oppo', 'a93', 'flex'],
  },
  {
    id: 'p010', name: 'Vibrator Motor Samsung S20 FE', slug: 'vibrator-samsung-s20fe',
    categoryId: 'vibrator', brand: 'Samsung', model: 'Galaxy S20 FE',
    partType: 'Vibrator Motor', condition: 'original', grade: 'A',
    statusTest: 'Vibrate strong', compatibility: 'S20 FE only',
    price: 55000, stock: 18, warranty: '7 hari',
    description: 'Vibrator motor Samsung Galaxy S20 FE original. Getaran kuat dan merata.',
    images: ['https://placehold.co/600x600/1a1a2e/e94560?text=Vibrator+S20FE'],
    tags: ['vibrator', 'samsung', 's20 fe', 'motor'],
  },
];

// Landing Page Component
function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-300">
              🔧 Spare Part & Service Smartphone
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
              Spare Part <span className="text-orange-400">Original</span> & Bergaransi
            </h1>
            <p className="mt-4 text-base text-blue-100 md:text-lg">
              Katalog spare part smartphone terlengkap. LCD, baterai, kamera, flex cable,
              dan komponen lainnya. Original copotan & bergaransi toko.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('catalog')}
                className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:scale-[1.02]"
              >
                🔍 Jelajahi Katalog
              </button>
              <button
                onClick={() => onNavigate('service')}
                className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3 font-semibold backdrop-blur hover:bg-white/20"
              >
                🛠️ Info Service
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Kategori */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900">Kategori Spare Part</h2>
        <p className="mt-1 text-sm text-gray-500">Pilih kategori yang kamu butuhkan</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => onNavigate('catalog', { category: cat.id })}
              className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white flex flex-col items-center rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="mt-2 text-sm font-medium text-gray-900">{cat.name}</span>
              <span className="mt-1 text-xs text-gray-500">{cat.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900">Spare Part Populer</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {PRODUCTS.slice(0, 8).map(p => (
            <button
              key={p.id}
              onClick={() => onNavigate('detail', { id: p.id })}
              className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white group rounded-xl border border-gray-200 bg-white text-left shadow-sm transition hover:shadow-md"
            >
              <div className="aspect-square overflow-hidden rounded-t-xl bg-gray-100">
                <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />
              </div>
              <div className="p-3">
                <p className="text-xs text-orange-600 font-medium">{p.brand} • {p.condition}</p>
                <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">{p.name}</h3>
                <p className="mt-1 text-sm font-bold text-blue-700">Rp {p.price.toLocaleString('id-ID')}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* CTA Service */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-3xl font-bold">Butuh Service Smartphone?</h2>
          <p className="mt-2 text-orange-100">Kami siap membantu. Hubungi kami atau kunjungi langsung workshop kami.</p>
          <button
            onClick={() => onNavigate('contact')}
            className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white mt-6 rounded-lg bg-white px-6 py-3 font-semibold text-orange-600 shadow-lg transition hover:scale-[1.02]"
          >
            📞 Hubungi Kami
          </button>
        </div>
      </section>
    </div>
  );
}

// Catalog Page
function CatalogPage({ initialCategory, onNavigate }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const filtered = PRODUCTS
    .filter(p => selectedCategory === 'all' || p.categoryId === selectedCategory)
    .filter(p => selectedCondition === 'all' || p.condition === selectedCondition)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.model.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Katalog Spare Part</h1>

        {/* Filters */}
        <div className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-4">
          <input
            type="text"
            placeholder="Cari spare part, brand, atau model..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
          />
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">Semua Kategori</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select
              value={selectedCondition}
              onChange={e => setSelectedCondition(e.target.value)}
              className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">Semua Kondisi</option>
              <option value="original">Original</option>
              <option value="compatible">Compatible</option>
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="name">Nama A-Z</option>
              <option value="price-asc">Harga Terendah</option>
              <option value="price-desc">Harga Tertinggi</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <p className="mt-4 text-sm text-gray-600">{filtered.length} produk ditemukan</p>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => onNavigate('detail', { id: p.id })}
              className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white group rounded-xl border border-gray-200 bg-white text-left shadow-sm transition hover:shadow-md"
            >
              <div className="aspect-square overflow-hidden rounded-t-xl bg-gray-100">
                <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${p.condition === 'original' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {p.condition === 'original' ? 'ORI' : 'COMPAT'}
                  </span>
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">Grade {p.grade}</span>
                </div>
                <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">{p.name}</h3>
                <p className="mt-1 text-xs text-gray-500">{p.brand} {p.model}</p>
                <p className="mt-1 text-sm font-bold text-blue-700">Rp {p.price.toLocaleString('id-ID')}</p>
                <p className="mt-1 text-xs text-gray-400">Stok: {p.stock}</p>
              </div>
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="mt-8 text-center text-gray-500">
            <p>Tidak ada produk yang cocok dengan filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Product Detail Page
function DetailPage({ productId, onNavigate }) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return <div className="p-8 text-center">Produk tidak ditemukan</div>;

  const category = CATEGORIES.find(c => c.id === product.categoryId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <button onClick={() => onNavigate('catalog')} className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white text-sm text-blue-600 hover:underline">← Kembali ke Katalog</button>

        <div className="mt-6 grid gap-8 md:grid-cols-2">
          {/* Image */}
          <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className={`rounded px-2 py-0.5 text-xs font-medium ${product.condition === 'original' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {product.condition === 'original' ? 'ORIGINAL' : 'COMPATIBLE'}
              </span>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Grade {product.grade}</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold text-gray-900 md:text-3xl">{product.name}</h1>
            <p className="mt-2 text-3xl font-extrabold text-blue-700">Rp {product.price.toLocaleString('id-ID')}</p>

            {/* Attributes */}
            <div className="mt-6 space-y-3 rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Brand</span>
                <span className="font-medium">{product.brand}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Model Compatible</span>
                <span className="font-medium">{product.model}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tipe Spare Part</span>
                <span className="font-medium">{product.partType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Kategori</span>
                <span className="font-medium">{category && category.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status Testing</span>
                <span className="font-medium text-green-600">{product.statusTest}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Garansi</span>
                <span className="font-medium">{product.warranty}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Stok</span>
                <span className="font-medium">{product.stock} tersisa</span>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h2 className="font-semibold text-gray-900">Deskripsi</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => onNavigate('contact', { product: product.name })}
                className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white w-full rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:scale-[1.01]"
              >
                💬 Tanya / Order via WhatsApp
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white w-full rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                📧 Kirim Inquiry
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Service Info Page
function ServicePage({ onNavigate }) {
  const fallbackServices = [
    { title: 'Ganti LCD/Display', description: 'LCD retak, bergaris, mati total, touch tidak responsif', price_label: 'Mulai Rp 200rb', icon: '📱' },
    { title: 'Ganti Baterai', description: 'Baterai bocor, cepat habis, tidak bisa charging', price_label: 'Mulai Rp 150rb', icon: '🔋' },
    { title: 'Ganti Kamera', description: 'Kamera blur, tidak fokus, error tidak terdeteksi', price_label: 'Mulai Rp 250rb', icon: '📷' },
    { title: 'Ganti Flex Cable', description: 'Flex charging, tombol power, fingerprint rusak', price_label: 'Mulai Rp 80rb', icon: '🔌' },
    { title: 'Ganti Charging Port', description: 'Port charging longgar, tidak bisa charge, data tidak terbaca', price_label: 'Mulai Rp 120rb', icon: '⚡' },
    { title: 'Service IC/Board', description: 'Mati total, bootloop, masalah IC power/charging', price_label: 'Mulai Rp 300rb', icon: '🔧' },
    { title: 'Ganti Back Cover', description: 'Cover belakang retak, patah, atau ingin ganti warna', price_label: 'Mulai Rp 100rb', icon: '🔲' },
    { title: 'Ganti Speaker/Mic', description: 'Speaker pecah, mic tidak berfungsi, earpiece error', price_label: 'Mulai Rp 80rb', icon: '🔊' },
    { title: 'Ganti Vibrator', description: 'Vibrator tidak berfungsi atau lemah', price_label: 'Mulai Rp 60rb', icon: '📳' }
  ];
  const [services, setServices] = useState(fallbackServices);
  useEffect(() => {
    getCatalog().then(remote => {
      if (remote.services?.length) setServices(remote.services);
    }).catch(() => {});
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Informasi Service</h1>
        <p className="mt-2 text-gray-600">Layanan perbaikan smartphone profesional</p>

        {/* Section heading */}
        <h2 className="mt-8 text-xl font-semibold text-gray-900">Layanan Service Kami</h2>

        {/* Services */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((svc, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <span className="text-3xl">{svc.icon}</span>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">{svc.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{svc.description}</p>
              <p className="mt-3 text-sm font-bold text-blue-700">{svc.price_label}</p>
            </div>
          ))}
        </div>

        {/* Why Us */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-blue-900 to-blue-800 p-8 text-white">
          <h2 className="text-2xl font-bold">Kenapa Pilih Mubarok Gadget Hub?</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="flex gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-semibold">Spare Part Berkualitas</h3>
                <p className="text-sm text-blue-200">Original copotan & bergaransi</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-semibold">Pengerjaan Cepat</h3>
                <p className="text-sm text-blue-200">Biasa selesai 1-3 hari</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <h3 className="font-semibold">Harga Kompetitif</h3>
                <p className="text-sm text-blue-200">Transparan, tanpa biaya tersembunyi</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <button
            onClick={() => onNavigate('contact')}
            className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white rounded-lg bg-orange-500 px-8 py-3 font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:scale-[1.02]"
          >
            📞 Hubungi Kami Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}

// Contact Page
function ContactPage({ productName, onNavigate }) {
  const [form, setForm] = useState({ name: '', phone: '', message: productName ? `Halo, saya tertarik dengan ${productName}. Apakah masih tersedia?` : '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phone = form.phone.replace(/[^0-9+]/g, '');
    try {
      await createInquiry({ name: form.name, phone, message: form.message });
    } catch (error) {
      console.error('Inquiry save failed:', error);
    }
    const waMessage = encodeURIComponent(form.message);
    const waPhone = '62895604901090';
    window.open(`https://wa.me/${waPhone}?text=${waMessage}`, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <button
          onClick={() => onNavigate('catalog')}
          className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white mb-6 text-sm text-blue-600 hover:underline"
        >← Kembali ke Katalog</button>

        <h2 className="text-xl font-semibold text-gray-900">Kirim Inquiry</h2>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {/* Contact Info */}
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900">📍 Alamat Workshop</h3>
              <p className="mt-2 text-sm text-gray-600">
                Mubarok Gadget Hub<br />
                Jl. Raya Blora, Jawa Tengah<br />
                Indonesia
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900">📞 Telepon / WhatsApp</h3>
              <p className="mt-2 text-sm text-gray-600">0895 6049 01090</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900">⏰ Jam Operasional</h3>
              <p className="mt-2 text-sm text-gray-600">Senin – Sabtu: 09.00 – 15.00 WIB</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {submitted ? (
              <div className="text-center py-12">
                <span className="text-5xl">✅</span>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">Inquiry Terkirim!</h3>
                <p className="mt-2 text-sm text-gray-600">Kami akan segera menghubungi Anda via WhatsApp.</p>
                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  <button
                    onClick={() => onNavigate('catalog')}
                    className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white"
                  >
                    Kembali ke Katalog
                  </button>
                  <button
                    onClick={() => onNavigate('landing')}
                    className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white rounded-lg bg-gray-200 px-6 py-2 text-sm font-medium text-gray-700"
                  >
                    Kembali ke Beranda
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pesan</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
                  />
                </div>
                <button
                  type="submit"
                  className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white w-full rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:scale-[1.01]"
                >
                  💬 Kirim via WhatsApp
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Error Boundary (class component)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 text-center">
          <span className="text-6xl">⚠️</span>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Terjadi gangguan sementara</h1>
          <p className="mt-2 max-w-md text-gray-600">
            Maaf, halaman mengalami kendala. Silakan coba kembali dalam beberapa saat.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700"
          >
            🔄 Refresh Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading skeleton component (inline, no extra file)
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-200 py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Hero bar skeleton */}
        <div className="mb-12 rounded-xl bg-gray-300 animate-pulse" style={{ height: '320px' }} />

        {/* Product card skeletons */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="overflow-hidden rounded-xl bg-gray-300 animate-pulse"
              style={{ aspectRatio: '1 / 1.15' }}
            >
              <div className="aspect-square w-full bg-gray-400" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-1/3 rounded bg-gray-400" />
                <div className="h-4 w-full rounded bg-gray-400" />
                <div className="h-4 w-2/3 rounded bg-gray-400" />
                <div className="h-5 w-1/2 rounded bg-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// App Shell
function App() {
  const [page, setPage] = useState('landing');
  const [data, setData] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadRemoteCatalog = async () => {
      try {
        const remote = await getCatalog();
        if (remote.products?.length) PRODUCTS.splice(0, PRODUCTS.length, ...remote.products);
        if (remote.categories?.length) CATEGORIES.splice(0, CATEGORIES.length, ...remote.categories);
      } catch (error) {
        console.warn('Cloudflare D1 unavailable; using fallback catalog.', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadRemoteCatalog();
    return () => { mounted = false; };
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const navigate = (newPage, newData) => {
    setPage(newPage);
    setData(newData || {});
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={() => navigate('landing')} className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white flex items-center gap-2">
            <span className="text-xl font-bold text-blue-900">Mubarok</span>
            <span className="text-xs text-gray-500">Gadget Hub</span>
          </button>
          <nav className="flex items-center gap-4">
            {/* Desktop nav (md+) */}
            <button onClick={() => navigate('catalog')} className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white hidden items-center text-sm font-medium text-gray-600 hover:text-blue-600 md:inline-flex">Katalog</button>
            <button onClick={() => navigate('service')} className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white hidden items-center text-sm font-medium text-gray-600 hover:text-blue-600 md:inline-flex">Service</button>
            <button onClick={() => navigate('contact')} className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white hidden rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600 md:inline-flex">Hubungi</button>
            {/* Mobile hamburger (< md) */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white inline-flex items-center justify-center rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 md:hidden min-h-[44px] min-w-[44px]"
              aria-label="Menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </>
                )}
              </svg>
            </button>
          </nav>
          {/* Mobile menu overlay (< md) */}
          {isOpen && (
            <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setIsOpen(false)}>
              <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col gap-1 p-4">
                  <button
                    onClick={() => { navigate('landing'); setIsOpen(false); }}
                    className="min-h-[44px] min-w-[44px] rounded-lg px-4 py-3 text-left text-base font-medium text-gray-700 hover:bg-blue-50"
                  >
                    Landing
                  </button>
                  <button
                    onClick={() => { navigate('catalog'); setIsOpen(false); }}
                    className="min-h-[44px] min-w-[44px] rounded-lg px-4 py-3 text-left text-base font-medium text-gray-700 hover:bg-blue-50"
                  >
                    Katalog
                  </button>
                  <button
                    onClick={() => { navigate('service'); setIsOpen(false); }}
                    className="min-h-[44px] min-w-[44px] rounded-lg px-4 py-3 text-left text-base font-medium text-gray-700 hover:bg-blue-50"
                  >
                    Service
                  </button>
                  <button
                    onClick={() => { navigate('contact'); setIsOpen(false); }}
                    className="mt-2 min-h-[44px] min-w-[44px] rounded-lg bg-orange-500 px-4 py-3 text-left text-base font-medium text-white shadow-sm hover:bg-orange-600"
                  >
                    Hubungi
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Pages */}
      {page === 'landing' && <LandingPage onNavigate={navigate} />}
      {page === 'catalog' && <CatalogPage initialCategory={data.category} onNavigate={navigate} />}
      {page === 'detail' && <DetailPage productId={data.id} onNavigate={navigate} />}
      {page === 'service' && <ServicePage onNavigate={navigate} />}
      {page === 'contact' && <ContactPage productName={data.product} onNavigate={navigate} />}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-900 py-8 text-gray-400">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm">
          <p className="font-medium text-white">Mubarok Gadget Hub</p>
          <p className="mt-1">Smartphone Service & Spare Part — Blora, Jawa Tengah</p>
          <p className="mt-1">© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const isAdminRoute = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');
  createRoot(rootElement).render(
    isAdminRoute ? (
      <Admin />
    ) : (
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    )
  );
}
