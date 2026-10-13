import Link from "next/link";
import { redirect } from "next/navigation";
import { KuisLockup } from "@/components/kuis-mark";
import { getSessionProfile } from "@/lib/session";
import { SignUpForm } from "./signup-form";

export default async function SignUpPage() {
  const profile = await getSessionProfile();
  if (profile) redirect("/");

  return (
    <main className="auth-page">
      <KuisLockup tone="onDark" markSize={72} />
      <div className="auth-card">
        <h1>Sign up</h1>
        <p className="lede mt-3 text-center">
          Use the email your instructor added to the class list. You choose the password.
        </p>
        <div className="mt-6">
          <SignUpForm />
        </div>
        <p className="mt-6 text-center">
          Already registered? <Link href="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}
