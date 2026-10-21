import { createClient } from "@/lib/supabase/server";
import { AddEmailForm } from "./add-form";
import { ImportStudentsForm } from "./import-form";
import { removeEmail } from "./actions";

export const maxDuration = 300;

type AllowlistRow = {
  email: string;
  role: "admin" | "student";
};

type StudentRow = {
  id: string;
  display_name: string;
  student_number: string;
  class_id: string | null;
};

export default async function RosterPage() {
  const supabase = await createClient();
  const [{ data }, { data: studentData }, { data: classData }] = await Promise.all([
    supabase.from("allowed_emails").select("email, role").eq("role", "admin").order("email", {
      ascending: true,
    }),
    supabase
      .from("profiles")
      .select("id, display_name, student_number, class_id")
      .eq("role", "student")
      .not("student_number", "is", null)
      .order("display_name", { ascending: true }),
    supabase.from("classes").select("id, name"),
  ]);

  const admins = (data ?? []) as AllowlistRow[];
  const students = (studentData ?? []) as StudentRow[];
  const classNames = new Map((classData ?? []).map((row) => [row.id, row.name]));

  return (
    <main className="page">
      <h1>Roster</h1>
      <p className="mt-4 max-w-[72ch]">
        Import the class Excel file so students can log in with their name and PIN. Administrators
        still sign in with email and password.
      </p>
      <ImportStudentsForm />
      <AddEmailForm />

      <h2 className="mt-10">Students</h2>
      {students.length === 0 ? (
        <p className="mt-4">No students imported yet.</p>
      ) : (
        <div className="table-wrap mt-4 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Name</th>
                <th>Class</th>
              </tr>
            </thead>
            <tbody>
              {students.map((row) => (
                <tr key={row.id}>
                  <td>{row.student_number}</td>
                  <td>{row.display_name}</td>
                  <td>{classNames.get(row.class_id ?? "") ?? "No class"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-10">Admins</h2>
      {admins.length === 0 ? (
        <p className="mt-4">No admin emails yet.</p>
      ) : (
        <div className="table-wrap mt-4 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((row) => (
                <tr key={row.email}>
                  <td>{row.email}</td>
                  <td>
                    <form action={removeEmail}>
                      <input type="hidden" name="email" value={row.email} />
                      <button className="btn btn-danger btn-sm" type="submit">
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

