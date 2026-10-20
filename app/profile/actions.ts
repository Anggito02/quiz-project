"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = {
  error?: string;
  notice?: string;
};

export async function updateOwnClass(
  _state: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const classId = String(formData.get("classId") ?? "").trim();
  if (!classId) return { error: "Choose a class." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Log in again to update your class." };

  const { error } = await supabase.rpc("update_own_class", { p_class_id: classId });
  if (error) {
    return {
      error: error.message.includes("administrator")
        ? "Your class is managed by the administrator."
        : "Could not update your class. Try again.",
    };
  }

  revalidatePath("/profile");
  return { notice: "Class updated." };
}
