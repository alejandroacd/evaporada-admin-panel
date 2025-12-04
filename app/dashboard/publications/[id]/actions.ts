"use server";

import { supabaseServer } from "@/lib/server";
import { revalidatePath } from "next/cache";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function updatePublication(formData: FormData) {
  try {
    const supabase = await supabaseServer();

    const id = formData.get("id") as string;
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();

    // Validar campos requeridos
    if (!id || !title) {
      return {
        success: false,
        error: "ID and title are required"
      };
    }

    // Verificar autenticación
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
      return {
        success: false,
        error: "Not authenticated"
      };
    }

    // Obtener imágenes existentes
    let existingImages: string[] = [];
    const existingImagesJson = formData.get("existingImages") as string;
    
    if (existingImagesJson) {
      try {
        existingImages = JSON.parse(existingImagesJson);
      } catch (jsonError) {
        console.error("Error parsing existingImages JSON:", jsonError);
        existingImages = [];
      }
    }

    // Subir nuevas imágenes
    const newImageFiles = formData.getAll("images") as File[];
    const uploadedUrls: string[] = [];

    for (const file of newImageFiles) {
      if (!file || file.size === 0) continue;

      // Validar tamaño del archivo (ejemplo: 5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: `File ${file.name} exceeds 5MB limit`
        };
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await uploadToCloudinary(buffer, {
          folder: "blog_publications",
          public_id: `pub_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          resource_type: "auto",
        });

        if (result?.secure_url) {
          uploadedUrls.push(result.secure_url);
        }
      } catch (uploadError) {
        console.error(`Error uploading file ${file.name}:`, uploadError);
        return {
          success: false,
          error: `Failed to upload ${file.name}`
        };
      }
    }

    // Combinar todas las imágenes
    const finalImages = [...existingImages, ...uploadedUrls];

    // Validar que haya al menos una imagen
    if (finalImages.length === 0) {
      return {
        success: false,
        error: "At least one image is required"
      };
    }

    // Actualizar en la base de datos
    const { error: updateError } = await supabase
      .from("publications")
      .update({
        title,
        description,
        images: finalImages,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Database update error:", updateError);
      return {
        success: false,
        error: `Database error: ${updateError.message}`
      };
    }

    // Revalidar las páginas afectadas
    revalidatePath("/dashboard/publications");
    revalidatePath(`/dashboard/publications/${id}`);

    return {
      success: true,
      message: "Publication updated successfully"
    };

  } catch (error) {
    console.error("Unexpected error in updatePublication:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
}