"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { revalidateLeaderboardBoard } from "@/lib/leaderboard-board";
import { createClient } from "@/lib/supabase/server";

export type CatalogState = {
  error?: string;
};

async function requireAdmin() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/");
  return supabase;
}

export async function addClass(
  _state: CatalogState,
  formData: FormData,
): Promise<CatalogState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Enter a class name." };

  const supabase = await requireAdmin();
  const { error } = await supabase.from("classes").insert({ name });
  if (error) {
    if (error.code === "23505") return { error: "That class already exists." };
    return { error: "Could not add that class." };
  }

  revalidatePath("/admin/classes");
  revalidatePath("/admin/roster");
  revalidateLeaderboardBoard();
  return {};
}

export async function removeClass(
  _state: CatalogState,
  formData: FormData,
): Promise<CatalogState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing class." };

  const supabase = await requireAdmin();
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error?.code === "23503") {
    return { error: "That class is still assigned to someone." };
  }
  if (error) return { error: "Could not remove that class." };

  revalidatePath("/admin/classes");
  revalidatePath("/admin/roster");
  revalidateLeaderboardBoard();
  return {};
}
