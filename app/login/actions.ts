"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
};

export async function logIn(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return { error: "Email or password is incorrect." };
    }
    return { error: error.message };
  }

  const { data: allowed, error: allowError } = await supabase.rpc("is_email_allowed", {
    p_email: email,
  });

  if (allowError) {
    await supabase.auth.signOut();
    return { error: "Could not check the class list. Try again." };
  }

  if (!allowed) {
    await supabase.auth.signOut();
    return { error: "This email is not on the class list." };
  }

  redirect("/");
}
