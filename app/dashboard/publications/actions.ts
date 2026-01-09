"use server";

import { cloudinary } from "@/lib/cloudinary";
import { supabaseServer } from "@/lib/server"; 
import { v4 as uuid } from "uuid";
import { redirect } from "next/navigation";
import { uploadToCloudinary } from "@/lib/cloudinary";


interface UpdateOrderItem {
  id: number | string;
  sort_order: number;
}

export async function updatePublicationOrder(items: UpdateOrderItem[]) {
  try {
    const supabase = await supabaseServer();
    
    // Actualizar todos los items en una transacción
    const updates = items.map(async (item) => {
      const { error } = await supabase
        .from('publications')
        .update({ 
          order: item.sort_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      if (error) throw error;
    });

    await Promise.all(updates);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating order:', error);
    return { success: false, error: 'Failed to update order' };
  }
}


export async function deletePublication(formData: FormData) {
  const id = formData.get("id") as string;

  const supabase = await supabaseServer();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) throw new Error("Not authenticated");

  const { data: existing, error: fetchError } = await supabase
    .from("publications")
    .select("images")
    .eq("id", id)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  if (existing?.images?.length) {
    await Promise.all(
      existing.images.map(async (url: string) => {
        const parts = url.split("/");
        const filename = parts[parts.length - 1].split(".")[0]; 
        const publicId = `blog_publications/${filename}`;

        await cloudinary.uploader.destroy(publicId);
      })
    );
  }

  const { error } = await supabase
    .from("publications")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  redirect("/dashboard/publications");
}


export async function createPublication(formData: FormData) {
  const supabase = await supabaseServer(); 
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  const files = formData.getAll("images") as File[]; 
  const imageUrls: string[] = [];

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return { success: false, message: "No estás autenticado. Por favor logueate." };
  }

  try {
    for (const file of files) {
      if (!(file instanceof File)) continue;
      if (file.size === 0) continue;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const options: Record<string, any> = {
        folder: "blog_publications",
        public_id: uuid(),
        resource_type: "image",
      };

      if (process.env.CLOUDINARY_UPLOAD_PRESET) {
        options.upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET;
      }

      const result = await uploadToCloudinary(buffer, options);
      imageUrls.push(result.secure_url);
    }

    const { error } = await supabase.from("publications").insert({
      title,
      description,
      images: imageUrls,
      user_id: user.id,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return { success: false, message: "Something went wrong: " + error.message };
    }

    return { success: true, message: "Publication created successfully", returnUrl: "/dashboard/publications" };
  } catch (err: any) {
    console.error("Upload error:", err);
    return { success: false, message: "Something went wrong when uploading images: " + err.message };
  }
}
