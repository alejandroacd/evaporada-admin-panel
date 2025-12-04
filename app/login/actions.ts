"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/server";

export async function login(formData: FormData) {
  const supabase = await supabaseServer();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error(error);
    redirect("/login?error=1");
  }

  redirect("/dashboard");
}