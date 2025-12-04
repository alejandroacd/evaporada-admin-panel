"use server";

import { supabaseServer } from "@/lib/server";
import { revalidatePath } from "next/cache";
import { uploadToCloudinary } from "@/lib/cloudinary"; // Make sure this path is correct

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
    // For Cloudinary, you might want to also delete the image from Cloudinary
    // But since you're using the free tier, you might just delete from DB
    // If you want to delete from Cloudinary too, you'll need:
    
    // 1. Extract public_id from URL
    // const urlParts = imageUrl.split('/');
    // const fileName = urlParts[urlParts.length - 1];
    // const publicId = fileName.split('.')[0];
    
    // 2. Delete from Cloudinary
    // await cloudinary.uploader.destroy(publicId);

    // For now, just delete from database
    const { error } = await supabase
      .from("portraits")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/dashboard/portraits");
    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    throw error;
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