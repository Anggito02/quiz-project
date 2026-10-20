import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  // profiles.role follows the roster; admin data and actions still check is_admin() in the database.
  if (profile.role !== "admin") redirect("/quizzes");
  return children;
}
