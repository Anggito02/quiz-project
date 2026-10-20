import Link from "next/link";
import { redirect } from "next/navigation";
import { KuisLockup } from "@/components/kuis-mark";
import { getSessionProfile } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { SignUpForm } from "./signup-form";

export default async function SignUpPage() {
  const profile = await getSessionProfile();
  if (profile) redirect("/");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("signup_classes");
  const classes = (data ?? []) as { id: string; name: string }[];

  return (
    <main className="auth-page">
      <KuisLockup tone="onDark" markSize={72} />
      <div className="auth-card">
        <h1>Sign up</h1>
        <p className="lede mt-3 text-center">
          Use the email your instructor added to the class list. Choose your class and password.
        </p>
        <div className="mt-6">
          <SignUpForm classes={classes} />
          {error ? (
            <p className="error-text mt-4">Could not load classes. Try again in a moment.</p>
          ) : classes.length === 0 ? (
            <p className="error-text mt-4">
              No classes are available yet. Ask the administrator to add one.
            </p>
          ) : null}
        </div>
        <p className="mt-6 text-center">
          Already registered? <Link href="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}
