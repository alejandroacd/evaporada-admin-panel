"use server";

import { supabaseServer } from "@/lib/server";
import { revalidatePath } from "next/cache";
import { uploadToCloudinary } from "@/lib/cloudinary"; // Make sure this path is correct
import { cloudinary } from "@/lib/cloudinary";
export async function uploadPortrait(formData: FormData) {
  const supabase = await supabaseServer();
  
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size exceeds 5MB limit");
  }

  try {
    // Get the next order number
    const { data: lastPortrait } = await supabase
      .from("portraits")
      .select("order")
      .order("order", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (lastPortrait?.order || 0) + 1;

    // Convert File to Buffer for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(buffer, {
      folder: "portraits", // Optional: organize in Cloudinary folder
      public_id: `portrait_${Date.now()}`,
      overwrite: false,
      resource_type: "image",
    });

    // Insert into portraits table with Cloudinary URL
    const { error: insertError } = await supabase
      .from("portraits")
      .insert({
        image_url: uploadResult.secure_url, // Use Cloudinary URL
        order: nextOrder,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw insertError;
    }

    revalidatePath("/dashboard/portraits");
    return { success: true, url: uploadResult.secure_url };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

export async function deletePortrait(formData: FormData) {
  const supabase = await supabaseServer();
  
  const id = formData.get("id") as string;
  const imageUrl = formData.get("image_url") as string;

  try {
    // Extraer public_id de Cloudinary si quieres borrar de allí también
    if (imageUrl.includes('cloudinary')) {
      try {
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const publicId = fileName.split('.')[0];
        const folder = 'portraits/';
        
        // Borrar de Cloudinary
        await cloudinary.uploader.destroy(`${folder}${publicId}`);
      } catch (cloudinaryError) {
        console.warn("Could not delete from Cloudinary:", cloudinaryError);
        // Continuar aunque falle Cloudinary, al menos borrar de DB
      }
    }

    // Borrar de la base de datos
    const { error } = await supabase
      .from("portraits")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/dashboard/portraits");
    
    // No retornes nada, solo revalida
    // Si necesitas notificar éxito/error, usa throw o maneja en el cliente
  } catch (error) {
    console.error("Delete error:", error);
    // Lanza el error para que el cliente lo capture
    throw new Error("Failed to delete portrait");
  }
}
export async function reorderPortraits(orderedIds: string[]) {
  const supabase = await supabaseServer();
  
  try {
    const updates = orderedIds.map((id, index) => ({
      id,
      order: index + 1,
    }));

    for (const update of updates) {
      await supabase
        .from("portraits")
        .update({ order: update.order })
        .eq("id", update.id);
    }

    revalidatePath("/dashboard/portraits");
    return { success: true };
  } catch (error) {
    console.error("Reorder error:", error);
    throw error;
  }
}