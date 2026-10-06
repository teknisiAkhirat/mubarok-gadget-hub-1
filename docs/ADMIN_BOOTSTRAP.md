# MGH Admin Bootstrap

The dashboard is available at **/admin**.

## 1. Configure Cloudflare

Add these build-time environment variables to the Cloudflare Pages project:

- `VITE_SUPABASE_URL` = `https://hitmyfexknnthllsujrf.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` = the project's **publishable** key (not a service-role/secret key).

Then redeploy.

## 2. Create the first admin account

In Supabase Dashboard → Authentication → Users, create the email/password user you want to use for MGH Admin.

After the user exists, run this SQL once in the Supabase SQL Editor, replacing the email:

```sql
insert into public.admin_users (user_id)
select id from auth.users
where email = 'YOUR-ADMIN-EMAIL@example.com'
on conflict (user_id) do nothing;
```

Do not put a service-role key in the browser or in Cloudflare `VITE_*` variables.

## 3. Use the dashboard

Open `/admin` and sign in.

The dashboard provides:
- overview: product count, total stock, services, new inquiries
- products: add/edit/delete, price, stock, category, photo URL, condition, warranty, featured/active
- categories: add/edit/delete
- services: add/edit/delete
- inquiries: view and update status

Public catalog/service pages read active records from Supabase when data exists, while the original demo data remains as a fallback during bootstrap.
