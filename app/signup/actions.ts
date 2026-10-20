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
  const classId = String(formData.get("classId") ?? "").trim();

  if (!email || !password || !displayName || !classId) {
    return { error: "Enter your email, password, display name, and class." };
  }

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      classId,
    )
  ) {
    return { error: "Choose a valid class." };
  }

  const supabase = await createClient();
  const [{ data: allowed, error: allowError }, { data: classes, error: classError }] =
    await Promise.all([
      supabase.rpc("is_email_allowed", { p_email: email }),
      supabase.rpc("signup_classes"),
    ]);

  if (allowError) {
    return { error: "Could not check the class list. Try again." };
  }

  if (!allowed) {
    return { error: "This email is not on the class list." };
  }

  if (classError || !classes?.some((row: { id: string }) => row.id === classId)) {
    return { error: "Choose a valid class." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName, class_id: classId } },
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
