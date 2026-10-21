import Link from "next/link";
import { redirect } from "next/navigation";
import { KuisLockup } from "@/components/kuis-mark";
import { getSessionProfile } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { AdminLoginForm } from "./admin-form";
import { StudentLoginForm } from "./student-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const profile = await getSessionProfile();
  if (profile) redirect("/");

  const { mode } = await searchParams;
  const admin = mode === "admin";

  const supabase = await createClient();
  const { data } = await supabase.rpc("signup_classes");
  const classes = (data ?? []) as { id: string; name: string }[];

  return (
    <main className="auth-page">
      <KuisLockup tone="onDark" markSize={72} />
      <div className="auth-card">
        <h1>{admin ? "Admin login" : "Log in"}</h1>
        <p className="lede mt-3 text-center">
          {admin
            ? "Use the administrator email and password."
            : "Choose your class, find your name, and enter your PIN."}
        </p>
        <div className="mt-6">
          {admin ? <AdminLoginForm /> : <StudentLoginForm classes={classes} />}
        </div>
        <p className="mt-6 text-center">
          {admin ? <Link href="/login">Student login</Link> : <Link href="/login?mode=admin">Admin login</Link>}
        </p>
      </div>
    </main>
  );
}
