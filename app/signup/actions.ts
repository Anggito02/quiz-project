"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignUpState = {
  error?: string;
  notice?: string;
};

export async function signUp(_state: SignUpState, formData: FormData): Promise<SignUpState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!email || !password || !displayName) {
    return { error: "Enter your email, password, and display name." };
  }

  const supabase = await createClient();
  const { data: allowed, error: allowError } = await supabase.rpc("is_email_allowed", {
    p_email: email,
  });

  if (allowError) {
    return { error: "Could not check the class list. Try again." };
  }

  if (!allowed) {
    return { error: "This email is not on the class list." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      return { error: "An account with this email already exists. Log in instead." };
    }
    return { error: error.message };
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: "An account with this email already exists. Log in instead." };
  }

  if (!data.session) {
    return {
      notice: "Check your email to confirm your account, then log in.",
    };
  }

  redirect("/");
}
