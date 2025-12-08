// app/dashboard/about/actions.ts
"use server";

import { supabaseServer } from "@/lib/server";
import { revalidatePath } from "next/cache";

interface AboutData {
  id: string | null;
  title: string;
  content: string;
}

// NUEVA FUNCIÓN: Obtener el último registro de About
export async function getLatestAbout() {
  const supabase = await supabaseServer();

  try {
    // Verificar autenticación
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
      return { success: false, error: "Not authenticated", data: null };
    }

    // Obtener el último registro por updated_at
    // IMPORTANTE: Cambia "about" por "public_about" si ese es el nombre real de tu tabla
    const { data, error } = await supabase
      .from("about") // O "about" si ese es el nombre
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Si la tabla está vacía, no es un error
      if (error.code === "PGRST116") {
        return { success: true, data: null, error: null };
      }
      console.error("Error fetching about data:", error);
      return { success: false, error: error.message, data: null };
    }

    return { 
      success: true, 
      data: data,
      error: null 
    };
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return { 
      success: false, 
      error: error.message || "Failed to fetch about data", 
      data: null 
    };
  }
}

// Funciones existentes (mantenemos las tuyas pero las adaptamos)
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
    // IMPORTANTE: Cambia "about" por "public_about" si ese es el nombre real
    const { data: result, error } = await supabase
      .from("about") // O "about" si ese es el nombre
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
    revalidatePath("/about");

    return { 
      success: true, 
      message: "About page created successfully",
      id: result.id
    };

  } catch (error: any) {
    console.error("Unexpected error:", error);
    return { 
      success: false, 
      error: error.message || "Unknown error" 
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
    // IMPORTANTE: Cambia "about" por "public_about" si ese es el nombre real
    const { error } = await supabase
      .from("about") // O "about" si ese es el nombre
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
    revalidatePath("/about");

    return { 
      success: true, 
      message: "About page updated successfully" 
    };

  } catch (error: any) {
    console.error("Unexpected error:", error);
    return { 
      success: false, 
      error: error.message || "Unknown error" 
    };
  }
}