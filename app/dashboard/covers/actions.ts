"use server";

import { supabaseServer } from "@/lib/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { v4 as uuid } from "uuid";
import { revalidatePath } from "next/cache";
import { cloudinary } from "@/lib/cloudinary";

export async function updateCover(formData: FormData) {
  console.log("=== UPDATE COVER ACTION START ===");
  
  const supabase = await supabaseServer();
  const section = formData.get("section") as string;
  const title = formData.get("title") as string;
  const imageFile = formData.get("image") as File;

  console.log("Section:", section);
  console.log("Title:", title);
  console.log("Image file exists:", !!imageFile);
  console.log("Image file size:", imageFile?.size);
  console.log("Image file name:", imageFile?.name);

  // 1. Verificar autenticación
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    console.log("ERROR: Usuario no autenticado");
    return { success: false, message: "No estás autenticado" };
  }

  try {
    // 2. Obtener el cover actual de la base de datos
    const { data: existingCover, error: fetchError } = await supabase
      .from("covers")
      .select("*")
      .eq("section", section)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows
      console.log("ERROR fetching existing cover:", fetchError);
      return { success: false, message: "Error al obtener cover existente: " + fetchError.message };
    }

    console.log("Existing cover:", existingCover);

    let imageUrl = existingCover?.image_url || null;

    // 3. Si hay una imagen nueva, subirla
    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
      console.log("Subiendo nueva imagen a Cloudinary...");
      
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadToCloudinary(buffer, {
        folder: "covers",
        public_id: `${section}_${Date.now()}`,
        resource_type: "image",
      });

      imageUrl = result.secure_url;
      console.log("Nueva URL de imagen:", imageUrl);

      // 4. Si había imagen anterior, eliminarla
      if (existingCover?.image_url) {
        try {
          const parts = existingCover.image_url.split("/");
          const filename = parts[parts.length - 1];
          const publicId = `covers/${filename.split(".")[0]}`;
          
          console.log("Eliminando imagen anterior:", publicId);
          await cloudinary.uploader.destroy(publicId);
        } catch (deleteError) {
          console.warn("No se pudo eliminar imagen anterior:", deleteError);
        }
      }
    }

    // 5. Validar que tenemos una URL
    if (!imageUrl) {
      console.log("ERROR: No hay URL de imagen");
      return { success: false, message: "Debes seleccionar una imagen" };
    }

    // 6. Preparar datos para UPDATE o INSERT
    const coverData = {
      section: section,
      title: title?.trim() || null,
      image_url: imageUrl,
      updated_at: new Date().toISOString(),
    };

    console.log("Datos a guardar en Supabase:", coverData);

    let result;
    
    // 7. Si ya existe, hacer UPDATE, si no, INSERT
    if (existingCover) {
      console.log("Haciendo UPDATE...");
      const { data, error } = await supabase
        .from("covers")
        .update(coverData)
        .eq("section", section)
        .select();

      result = { data, error };
      console.log("UPDATE result:", { data, error });
    } else {
      console.log("Haciendo INSERT...");
      const { data, error } = await supabase
        .from("covers")
        .insert([coverData])
        .select();

      result = { data, error };
      console.log("INSERT result:", { data, error });
    }

    // 8. Verificar error
    if (result.error) {
      console.log("ERROR en operación de BD:", result.error);
      return { 
        success: false, 
        message: `Error en base de datos: ${result.error.message}` 
      };
    }

    console.log("=== UPDATE COVER ACTION SUCCESS ===");

    // 9. Revalidar
    revalidatePath("/dashboard/covers");
    revalidatePath("/");

    return { 
      success: true, 
      message: "Cover actualizado exitosamente",
      returnUrl: "/dashboard/covers"
    };

  } catch (err: any) {
    console.log("=== UPDATE COVER ACTION ERROR ===");
    console.error("Error completo:", err);
    return { 
      success: false, 
      message: `Error: ${err.message || "Error desconocido"}` 
    };
  }
}
export async function getAllCovers() {
  const supabase = await supabaseServer();
  
  const { data, error } = await supabase
    .from('covers')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching all covers:', error);
    return [];
  }

  return data || [];
}