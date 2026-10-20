# MGH — Setup Cloudflare (D1 + Admin)

Semua langkah di bawah dilakukan **pemilik** di komputer/Termux sendiri. Jangan tempel secret ke chat, issue, atau PR.

## 1. Buat database D1 (sekali)
```
npx wrangler login
npx wrangler d1 create mgh-db
```
Salin `database_id` ke `wrangler.toml` (ID bukan secret), commit.

## 2. Terapkan skema
```
npx wrangler d1 migrations apply mgh-db --local    # uji lokal dulu
npx wrangler d1 migrations apply mgh-db --remote   # produksi
```

## 3. Buat password admin (hash, bukan teks biasa)
```
node scripts/hash-password.mjs 'PasswordPanjangMinimal12'
```
Simpan keluaran `pbkdf2$...` sebagai secret, bukan di Git:
```
npx wrangler pages secret put ADMIN_PASSWORD_HASH --project-name mubarok-gadget-hub-1
npx wrangler pages secret put ADMIN_EMAIL --project-name mubarok-gadget-hub-1
npx wrangler pages secret put ADMIN_SESSION_SECRET --project-name mubarok-gadget-hub-1   # string acak >= 32 karakter
```
Binding `MGH_DB` dipasang di dashboard Pages → Settings → Bindings → D1 (Production & Preview, gunakan database terpisah untuk preview bila memungkinkan).

## 4. Deploy
Hubungkan repo ke Cloudflare Pages (build: `npm run build`, output: `dist`), lalu buka `/admin`.

## Pengujian
`npm test` (memakai SQLite in-memory, tidak menyentuh database produksi).

## Catatan keamanan yang masih manual
- Pasang Rate Limiting rule Cloudflare untuk `/api/admin/login` dan `/api/inquiries`.
- Frontend lama masih memuat `src/lib/supabase.js`; tidak dipakai untuk data, boleh dihapus pada PR berikutnya.
