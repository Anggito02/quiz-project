import Link from "next/link";
import { redirect } from "next/navigation";
import { KuisLockup } from "@/components/kuis-mark";
import { getSessionProfile } from "@/lib/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const profile = await getSessionProfile();
  if (profile) redirect("/");

  return (
    <main className="auth-page">
      <KuisLockup tone="onDark" markSize={72} />
      <div className="auth-card">
        <h1>Log in</h1>
        <p className="lede mt-3 text-center">Use the email and password you chose at sign-up.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-center">
          New here? <Link href="/signup">Sign up</Link>
        </p>
      </div>
    </main>
  );
}
