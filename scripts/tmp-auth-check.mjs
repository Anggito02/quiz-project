import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const email = process.argv[2];
const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 100 });
if (error) {
  console.log(JSON.stringify({ error: error.message }));
  process.exit(1);
}
const user = (data.users ?? []).find((row) => (row.email ?? "").toLowerCase() === email);
if (!user) {
  console.log(JSON.stringify({ found: false }));
  process.exit(0);
}
const updated = await admin.auth.admin.updateUserById(user.id, { email_confirm: true });
console.log(
  JSON.stringify({
    found: true,
    confirmError: updated.error ? updated.error.message : null,
    confirmed: Boolean(updated.data.user?.email_confirmed_at),
  }),
);
