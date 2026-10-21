import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("class_id, student_number")
    .eq("id", profile.id)
    .single();

  const classId = (profileRow as { class_id: string | null } | null)?.class_id ?? null;
  const studentNumber =
    (profileRow as { student_number: string | null } | null)?.student_number ?? null;
  let currentClass = "No class";
  if (classId) {
    const { data: classRow } = await supabase.from("classes").select("name").eq("id", classId).maybeSingle();
    currentClass = classRow?.name ?? "No class";
  }

  return (
    <main className="page">
      <h1>Profile</h1>
      <div className="card mt-8 grid max-w-xl gap-6">
        <div>
          <p className="label">Display name</p>
          <p className="mt-2">{profile.displayName}</p>
        </div>
        {profile.role === "admin" ? (
          <div>
            <p className="label">Email</p>
            <p className="mt-2">{profile.email}</p>
          </div>
        ) : (
          <div>
            <p className="label">Student number</p>
            <p className="mt-2">{studentNumber ?? "—"}</p>
          </div>
        )}
        <div>
          <p className="label">Class</p>
          <p className="mt-2">{currentClass}</p>
        </div>
      </div>
    </main>
  );
}
