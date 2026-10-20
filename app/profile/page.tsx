import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { ClassForm } from "./class-form";

export default async function ProfilePage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const [{ data: profileRow }, { data: classRows }, { data: canChooseClass }] =
    await Promise.all([
      supabase.from("profiles").select("class_id").eq("id", profile.id).single(),
      supabase.from("classes").select("id, name").order("name", { ascending: true }),
      supabase.rpc("can_choose_own_class"),
    ]);

  const classes = (classRows ?? []) as { id: string; name: string }[];
  const currentClassId = (profileRow as { class_id: string | null } | null)?.class_id ?? null;
  const currentClass = classes.find((row) => row.id === currentClassId)?.name ?? "No class";

  return (
    <main className="page">
      <h1>Profile</h1>
      <div className="card mt-8 grid max-w-xl gap-6">
        <div>
          <p className="label">Display name</p>
          <p className="mt-2">{profile.displayName}</p>
        </div>
        <div>
          <p className="label">Email</p>
          <p className="mt-2">{profile.email}</p>
        </div>
        {canChooseClass ? (
          <ClassForm classes={classes} currentClassId={currentClassId} />
        ) : (
          <div>
            <p className="label">Class</p>
            <p className="mt-2">{currentClass}</p>
            <p className="muted mt-2">This class is managed by the administrator.</p>
          </div>
        )}
      </div>
    </main>
  );
}
