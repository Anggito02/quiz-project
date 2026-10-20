import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type SessionProfile = {
  id: string;
  email: string;
  displayName: string;
  role: "admin" | "student";
};

export const getSessionProfile = cache(async (): Promise<SessionProfile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const { data: allowed, error: allowError } = await supabase.rpc("is_email_allowed", {
    p_email: user.email,
  });

  if (!allowError && allowed === false) {
    await supabase.auth.signOut();
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "admin" && profile.role !== "student")) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.display_name,
    role: profile.role,
  };
});
