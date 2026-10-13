import { createClient } from "@/lib/supabase/server";
import { AddClassForm, RemoveClassForm } from "./add-form";

type ClassRow = {
  id: string;
  name: string;
};

export default async function ClassesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("classes").select("id, name").order("name", { ascending: true });
  const classes = (data ?? []) as ClassRow[];

  return (
    <main className="page">
      <h1>Classes</h1>
      <p className="mt-4 max-w-[72ch]">
        Add the class names you can assign to an email on the roster. People pick up that class when they sign up.
      </p>
      <AddClassForm />
      {classes.length === 0 ? (
        <p className="mt-8">No classes yet.</p>
      ) : (
        <div className="table-wrap mt-8 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>
                    <RemoveClassForm id={row.id} />
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
