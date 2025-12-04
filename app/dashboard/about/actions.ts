// app/dashboard/about/actions.ts
"use server";

import { supabaseServer } from "@/lib/server";
import { revalidatePath } from "next/cache";

interface AboutData {
  id: string | null;
  title: string;
  content: string;
}

export async function createAbout(data: AboutData) {
  const supabase = await supabaseServer();

  try {
    // Validar datos
    if (!data.title.trim()) {
      return { success: false, error: "Title is required" };
    }

    if (!data.content.trim()) {
      return { success: false, error: "Content is required" };
    }

    // Verificar autenticación
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Crear nuevo registro
    const { data: result, error } = await supabase
      .from("about")
      .insert({
        title: data.title.trim(),
        content: data.content.trim(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Create error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/about");
    revalidatePath("/about"); // Si tienes página pública en /about

    return { 
      success: true, 
      message: "About page created successfully",
      id: result.id
    };

  } catch (error) {
    console.error("Unexpected error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

export async function updateAbout(data: AboutData) {
  const supabase = await supabaseServer();

  try {
    // Validar datos
    if (!data.id) {
      return { success: false, error: "No page ID provided" };
    }

    if (!data.title.trim()) {
      return { success: false, error: "Title is required" };
    }

    if (!data.content.trim()) {
      return { success: false, error: "Content is required" };
    }

    // Verificar autenticación
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Actualizar registro existente
    const { error } = await supabase
      .from("about")
      .update({
        title: data.title.trim(),
        content: data.content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    if (error) {
      console.error("Update error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/about");
    revalidatePath("/about"); // Si tienes página pública en /about

    return { 
      success: true, 
      message: "About page updated successfully" 
    };

  } catch (error) {
    console.error("Unexpected error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

export async function deleteAbout() {
  const supabase = await supabaseServer();

  try {
    // Verificar autenticación
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Eliminar todos los registros (solo debería haber uno)
    const { error } = await supabase
      .from("about")
      .delete()
      .neq("id", ""); // Elimina todos

    if (error) {
      console.error("Delete error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/about");
    revalidatePath("/about");

    return { 
      success: true, 
      message: "About page deleted successfully" 
    };

  } catch (error) {
    console.error("Unexpected error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}