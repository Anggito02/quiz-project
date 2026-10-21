"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isStudentEmail, normalizePin, studentEmail, studentPassword } from "@/lib/serdik";

export type LoginState = {
  error?: string;
};

export type ClassStudent = {
  id: string;
  displayName: string;
  studentNumber: string;
};

export async function listClassStudents(classId: string): Promise<
  { students: ClassStudent[] } | { error: string }
> {
  if (!classId) return { error: "Choose a class." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_class_students", { p_class_id: classId });
  if (error) {
    const missing =
      error.code === "PGRST202" ||
      error.message.toLowerCase().includes("list_class_students") ||
      error.message.toLowerCase().includes("could not find the function");
    return {
      error: missing
        ? "Student login is not ready yet. Ask the administrator to run migration 013."
        : "Could not load that class. Try again.",
    };
  }

  return {
    students: ((data ?? []) as { id: string; display_name: string; student_number: string }[]).map(
      (row) => ({
        id: row.id,
        displayName: row.display_name,
        studentNumber: row.student_number,
      }),
    ),
  };
}

export async function logInStudent(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const studentNumber = String(formData.get("studentNumber") ?? "").trim();
  const pin = normalizePin(String(formData.get("pin") ?? ""));

  if (!studentNumber || !pin) {
    return { error: "Choose your name and enter your 6-digit PIN." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: studentEmail(studentNumber),
    password: studentPassword(pin),
  });

  if (error) {
    return { error: "Name or PIN is incorrect." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !isStudentEmail(user.email)) {
    await supabase.auth.signOut();
    return { error: "Name or PIN is incorrect." };
  }

  redirect("/");
}

export async function logInAdmin(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return { error: "Email or password is incorrect." };
    }
    return { error: error.message };
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || !isAdmin) {
    await supabase.auth.signOut();
    return { error: "Use the student login and your PIN." };
  }

  redirect("/");
}
