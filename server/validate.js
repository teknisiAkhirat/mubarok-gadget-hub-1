const str = (v) => String(v ?? '').trim();
function toInt(v) {
  if (v === '' || v == null) return 0;
  const n = typeof v === 'number' ? v : /^\s*\d+\s*$/.test(String(v)) ? Number(v) : NaN;
  return Number.isSafeInteger(n) ? n : NaN;
}
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const CONDITIONS = ['original', 'compatible', 'baru', 'bekas'];
const URL_OK = /^(https?:\/\/|\/)[^\s]*$/i;

export function validateProduct(b) {
  const e = [];
  const name = str(b.name);
  if (!name || name.length > 200) e.push('Nama produk wajib diisi (maks 200 karakter).');
  const slug = str(b.slug).toLowerCase() || slugify(name);
  if (!SLUG.test(slug) || slug.length > 200) e.push('Slug tidak valid (huruf kecil, angka, tanda minus).');
  const price = toInt(b.price), cost = toInt(b.cost_price), stock = toInt(b.stock);
  if (!(price >= 0 && price <= 1e10)) e.push('Harga harus bilangan bulat >= 0.');
  if (!(cost >= 0 && cost <= 1e10)) e.push('Harga modal harus bilangan bulat >= 0.');
  if (!(stock >= 0 && stock <= 1e6)) e.push('Stok harus bilangan bulat >= 0.');
  const condition = str(b.condition) || 'original';
  if (!CONDITIONS.includes(condition)) e.push('Kondisi tidak valid.');
  const image = str(b.image_url);
  if (image && (image.length > 1000 || !URL_OK.test(image))) e.push('URL foto harus diawali http(s):// atau /.');
  const sku = str(b.sku);
  if (sku.length > 64) e.push('SKU maks 64 karakter.');
  const description = str(b.description);
  if (description.length > 5000) e.push('Deskripsi terlalu panjang.');
  let category_id = null;
  if (b.category_id !== null && b.category_id !== undefined && b.category_id !== '') {
    category_id = toInt(b.category_id);
    if (!(category_id > 0)) e.push('Kategori tidak valid.');
  }
  for (const k of ['brand', 'model', 'part_type', 'grade', 'warranty', 'status_test', 'compatibility']) if (str(b[k]).length > 300) e.push(`Field ${k} terlalu panjang.`);
  const tags = Array.isArray(b.tags) ? JSON.stringify(b.tags.map(str).slice(0, 30)) : str(b.tags);
  return { errors: e, data: { category_id, sku: sku || null, name, slug, brand: str(b.brand), model: str(b.model), part_type: str(b.part_type), condition, grade: str(b.grade), price, cost_price: cost, stock, warranty: str(b.warranty), status_test: str(b.status_test), compatibility: str(b.compatibility), image_url: image, is_featured: b.featured ? 1 : 0, is_active: b.active === false ? 0 : 1, description, tags } };
}
export function validateCategory(b) {
  const e = [];
  const name = str(b.name);
  if (!name || name.length > 120) e.push('Nama kategori wajib diisi.');
  const slug = str(b.slug).toLowerCase() || slugify(name);
  if (!SLUG.test(slug)) e.push('Slug tidak valid.');
  const sort = toInt(b.sort_order);
  if (!(sort >= 0 && sort <= 100000)) e.push('Urutan tidak valid.');
  return { errors: e, data: { name, slug, icon: str(b.icon).slice(0, 16), description: str(b.description).slice(0, 2000), sort_order: sort, is_active: b.active === false ? 0 : 1 } };
}
export function validateService(b) {
  const e = [];
  const name = str(b.name || b.title);
  if (!name || name.length > 200) e.push('Nama layanan wajib diisi.');
  let price_from = null;
  if (b.price_from !== '' && b.price_from != null) {
    price_from = toInt(b.price_from);
    if (!(price_from >= 0 && price_from <= 1e10)) e.push('Harga mulai dari tidak valid.');
  }
  const sort = toInt(b.sort_order);
  if (!(sort >= 0 && sort <= 100000)) e.push('Urutan tidak valid.');
  return { errors: e, data: { name, description: str(b.description).slice(0, 2000), price_from, duration: str(b.duration).slice(0, 100), warranty: str(b.warranty).slice(0, 100), is_active: b.active === false ? 0 : 1, sort_order: sort } };
}
export function validateInquiryStatus(b) {
  const ok = ['new', 'contacted', 'done', 'cancelled'].includes(b.status);
  return { errors: ok ? [] : ['Status tidak valid.'], data: { status: b.status } };
}
export const validators = { products: validateProduct, categories: validateCategory, services: validateService, inquiries: validateInquiryStatus };
