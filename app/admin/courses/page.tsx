import { createClient } from "@/lib/supabase/server";
import { AddCourseForm, RemoveCourseForm } from "./add-form";

type CourseRow = {
  id: string;
  name: string;
};

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("id, name").order("name", { ascending: true });
  const courses = (data ?? []) as CourseRow[];

  return (
    <main className="page">
      <h1>Courses</h1>
      <p className="mt-4 max-w-[72ch]">
        Add the course names that can be attached to a quiz. Students still see every published quiz.
      </p>
      <AddCourseForm />
      {courses.length === 0 ? (
        <p className="mt-8">No courses yet.</p>
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
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.name}</td>
                  <td>
                    <RemoveCourseForm id={course.id} />
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
