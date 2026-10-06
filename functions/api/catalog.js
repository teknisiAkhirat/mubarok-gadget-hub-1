export async function onRequestGet({ env }) {
  const [categories, products, services] = await Promise.all([
    env.MGH_DB.prepare("SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order, name").all(),
    env.MGH_DB.prepare("SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.is_active = 1 ORDER BY p.created_at DESC").all(),
    env.MGH_DB.prepare("SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order, name").all(),
  ]);
  return Response.json({
    categories: categories.results.map(c => ({ ...c, id: c.slug, active: Boolean(c.is_active) })),
    products: products.results.map(p => ({ ...p, id: String(p.id), categoryId: p.category_slug || null, partType: p.part_type, statusTest: p.status_test, featured: Boolean(p.is_featured), active: Boolean(p.is_active), images: p.image_url ? [p.image_url] : ['https://placehold.co/600x600/0b1f33/ffffff?text=MGH'], tags: p.tags ? JSON.parse(p.tags) : [] })),
    services: services.results.map(s => ({ ...s, id: String(s.id), title: s.name, price_label: s.price_from == null ? '' : 'Mulai Rp ' + Number(s.price_from).toLocaleString('id-ID'), active: Boolean(s.is_active) })),
  });
}