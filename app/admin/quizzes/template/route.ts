import { redirect } from "next/navigation";
import { buildQuizTemplate } from "@/lib/quiz-excel";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/login");

  const body = await buildQuizTemplate();
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="dirmanquiz-questions.xlsx"',
    },
  });
}
