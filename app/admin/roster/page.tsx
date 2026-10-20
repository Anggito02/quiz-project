import { createClient } from "@/lib/supabase/server";
import { AddEmailForm } from "./add-form";
import { removeEmail, updateRole } from "./actions";

type AllowlistRow = {
  email: string;
  role: "admin" | "student";
  class_id: string | null;
};

export default async function RosterPage() {
  const supabase = await createClient();
  const [{ data }, { data: classData }] = await Promise.all([
    supabase.from("allowed_emails").select("email, role, class_id").order("email", { ascending: true }),
    supabase.from("classes").select("id, name").order("name", { ascending: true }),
  ]);

  const rows = (data ?? []) as AllowlistRow[];
  const classes = (classData ?? []) as { id: string; name: string }[];

  return (
    <main className="page">
      <h1>Roster</h1>
      <p className="mt-4 max-w-[72ch]">
        Add the emails that may sign up, and set each email&apos;s role and class. A rule such as
        *@corp.gmail.com allows every address at that domain. An exact email overrides a rule.
        People choose their own password at sign-up.
      </p>
      <AddEmailForm classes={classes} />

      {rows.length === 0 ? (
        <p className="mt-8">No emails on the class list yet.</p>
      ) : (
        <div className="table-wrap mt-8 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role and class</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.email}>
                  <td>
                    {row.email}
                    {row.email.includes("*") ? <div className="muted">Wildcard</div> : null}
                  </td>
                  <td>
                    <form action={updateRole} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="email" value={row.email} />
                      <select className="input" name="role" defaultValue={row.role} aria-label="Role">
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                      <select
                        className="input"
                        name="classId"
                        defaultValue={row.class_id ?? ""}
                        aria-label="Class"
                      >
                        <option value="">No class</option>
                        {classes.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                      <button className="btn btn-admin btn-sm" type="submit">
                        Save
                      </button>
                    </form>
                  </td>
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
