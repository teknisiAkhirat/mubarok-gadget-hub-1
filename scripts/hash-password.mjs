// Pakai: node scripts/hash-password.mjs 'PasswordBaruAnda'
// Hasilnya disimpan sebagai secret ADMIN_PASSWORD_HASH (wrangler pages secret put), JANGAN di-commit.
import { hashPassword } from '../server/auth.js';
const pw = process.argv[2];
if (!pw || pw.length < 12) { console.error('Password minimal 12 karakter.'); process.exit(1); }
console.log(await hashPassword(pw));
