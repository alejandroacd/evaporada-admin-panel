"use server";
import { supabaseServer } from "@/lib/server";
import { v4 as uuid } from "uuid";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { cloudinary } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";


export interface UpdateDisplayOrderItem {
  id: number | string;
  order: number; // Tu columna se llama 'order' en lugar de 'sort_order'
}

export async function updateDisplayOrder(items: UpdateDisplayOrderItem[]) {
  try {
    const supabase = await supabaseServer();
    
    // Actualizar todos los items en una transacción
    const updates = items.map(async (item) => {
      let id: number;
      
      // Convertir id a número si es string
      if (typeof item.id === 'string') {
        id = parseInt(item.id, 10);
        if (isNaN(id)) {
          throw new Error(`Invalid ID: ${item.id}`);
        }
      } else {
        id = item.id;
      }
      
      const { error } = await supabase
        .from('displays')
        .update({ 
          order: item.order, // Usa 'order' que es el nombre de tu columna
        })
        .eq('id', id);

      if (error) throw error;
    });

    await Promise.all(updates);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating display order:', error);
    return { success: false, error: 'Failed to update display order' };
  }
}

// Constants for validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_FILES = 10;

// Validation helper functions
function validateFile(file: File): { isValid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: `File ${file.name} exceeds 5MB limit` };
  }
  
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { isValid: false, error: `File ${file.name} has unsupported type: ${file.type}` };
  }
  
  return { isValid: true };
}

function validateFiles(files: File[]): { isValid: boolean; error?: string } {
  if (files.length === 0) {
    return { isValid: false, error: "At least one image is required" };
  }
  
  if (files.length > MAX_FILES) {
    return { isValid: false, error: `Maximum ${MAX_FILES} files allowed` };
  }
  
  for (const file of files) {
    const validation = validateFile(file);
    if (!validation.isValid) {
      return validation;
    }
  }
  
  return { isValid: true };
}

// Cloudinary cleanup helper
async function cleanupCloudinaryImages(imageUrls: string[]): Promise<void> {
  if (!imageUrls?.length) return;
  
  const deletePromises = imageUrls.map(async (url: string) => {
    try {
      // Extract public_id from URL
      const parts = url.split('/');
      const filename = parts.pop();
      if (!filename) return;
      
      const publicId = filename.split('.')[0];
      const fullPublicId = `displays/${publicId}`;
      
      await cloudinary.uploader.destroy(fullPublicId);
    } catch (error) {
      // Log but don't fail the entire operation if one image cleanup fails
      console.error(`Failed to delete Cloudinary image: ${url}`, error);
    }
  });
  
  await Promise.allSettled(deletePromises);
}

export async function createDisplayAction(formData: FormData): Promise<{
  success: boolean;
  message: string;
  data?: { id?: string; urls?: string[] };
}> {
  const supabase = await supabaseServer();

  try {
    // Validate authentication
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      return { success: false, message: "Authentication failed. Please sign in again." };
    }
    
    const user = userData.user;
    
    if (!user) {
      return { success: false, message: "Not authenticated. Please sign in." };
    }

    // Extract and validate form data
    const title = formData.get("title") as string;
    const files = formData.getAll("images") as File[];

    // Validate title
    if (!title?.trim()) {
      return { success: false, message: "Title is required" };
    }

    if (title.length > 200) {
      return { success: false, message: "Title must be less than 200 characters" };
    }

    // Validate files
    const filesValidation = validateFiles(files);
    if (!filesValidation.isValid) {
      return { success: false, message: filesValidation.error! };
    }

    // Upload files to Cloudinary
    const uploadPromises = files.map(async (file) => {
      try {
        // Check if file is actually a File object
        if (!(file instanceof File)) {
          throw new Error("Invalid file object");
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await uploadToCloudinary(buffer, {
          folder: "displays",
          public_id: uuid(),
          resource_type: "image",
          timeout: 30000, // 30 second timeout
        });

        if (!result.secure_url) {
          throw new Error("Failed to get image URL from Cloudinary");
        }

        return result.secure_url;
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        throw new Error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    });

    // Execute all uploads
    const uploadedResults = await Promise.allSettled(uploadPromises);
    
    // Check for failed uploads
    const failedUploads = uploadedResults.filter((result): result is PromiseRejectedResult => 
      result.status === 'rejected'
    );
    
    if (failedUploads.length > 0) {
      // Cleanup any successfully uploaded images
      const successfulUrls = uploadedResults
        .filter((result): result is PromiseFulfilledResult<string> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);
      
      await cleanupCloudinaryImages(successfulUrls);
      
      const errorMessages = failedUploads.map(f => f.reason?.message || "Unknown error").join(", ");
      return { 
        success: false, 
        message: `Failed to upload some images: ${errorMessages}` 
      };
    }

    // Get all successful URLs
    const urls = uploadedResults
      .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
      .map(result => result.value);

    // Insert into database
    const { data: displayData, error: dbError } = await supabase
      .from("displays")
      .insert({
        title: title.trim(),
        images: urls,
        user_id: user.id,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (dbError) {
      // Rollback: Delete uploaded images if database insert fails
      await cleanupCloudinaryImages(urls);
      
      if (dbError.code === "23505") {
        return { success: false, message: "A display with this title already exists" };
      }
      
      console.error("Database error:", dbError);
      return { 
        success: false, 
        message: "Failed to save display to database. Please try again." 
      };
    }

    // Revalidate the displays page
    revalidatePath("/dashboard/displays");

    return {
      success: true,
      message: "Display created successfully",
      data: {
        id: displayData.id,
        urls,
      },
    };
  } catch (error: any) {
    console.error("Unexpected error in createDisplayAction:", error);
    
    // Attempt to provide a user-friendly message
    if (error.message?.includes("ECONNRESET") || error.message?.includes("timeout")) {
      return { 
        success: false, 
        message: "Network error. Please check your connection and try again." 
      };
    }
    
    if (error.message?.includes("413")) {
      return { 
        success: false, 
        message: "File too large. Please upload smaller images (max 5MB each)." 
      };
    }
    
    return { 
      success: false, 
      message: error.message || "An unexpected error occurred. Please try again." 
    };
  }
}

export async function updateDisplayAction(formData: FormData): Promise<{
  success: boolean;
  message: string;
}> {
  const supabase = await supabaseServer();

  try {
    // Validate authentication
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      return { success: false, message: "Authentication failed. Please sign in again." };
    }
    
    const user = userData.user;
    
    if (!user) {
      return { success: false, message: "Not authenticated. Please sign in." };
    }

    // Extract form data
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const prevImagesRaw = formData.get("prevImages") as string;
    const newFiles = formData.getAll("images") as File[];

    // Validate required fields
    if (!id) {
      return { success: false, message: "Display ID is required" };
    }

    if (!title?.trim()) {
      return { success: false, message: "Title is required" };
    }

    if (title.length > 200) {
      return { success: false, message: "Title must be less than 200 characters" };
    }

    // Parse previous images
    let prevImages: string[] = [];
    try {
      prevImages = prevImagesRaw ? JSON.parse(prevImagesRaw) : [];
      if (!Array.isArray(prevImages)) {
        prevImages = [];
      }
    } catch (error) {
      console.error("Failed to parse prevImages:", error);
      return { success: false, message: "Invalid previous images data" };
    }

    // Validate new files if any
    if (newFiles.length > 0) {
      const filesValidation = validateFiles(newFiles);
      if (!filesValidation.isValid) {
        return { success: false, message: filesValidation.error! };
      }
    }

    // Check if display exists and belongs to user
    const { data: existingDisplay, error: fetchError } = await supabase
      .from("displays")
      .select("images, user_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return { success: false, message: "Display not found" };
      }
      return { success: false, message: "Failed to fetch display data" };
    }

    if (existingDisplay.user_id !== user.id) {
      return { success: false, message: "You are not authorized to update this display" };
    }

    // Upload new files if any
    const newUrls: string[] = [];
    if (newFiles.length > 0) {
      const uploadPromises = newFiles.map(async (file) => {
        try {
          if (!(file instanceof File)) {
            throw new Error("Invalid file object");
          }

          const buffer = Buffer.from(await file.arrayBuffer());
          const result = await uploadToCloudinary(buffer, {
            folder: "displays",
            public_id: uuid(),
            resource_type: "image",
            timeout: 30000,
          });

          if (!result.secure_url) {
            throw new Error("Failed to get image URL from Cloudinary");
          }

          return result.secure_url;
        } catch (error) {
          console.error(`Failed to upload new file ${file.name}:`, error);
          throw new Error(`Failed to upload ${file.name}`);
        }
      });

      const uploadResults = await Promise.allSettled(uploadPromises);
      
      // Check for failed uploads
      const failedUploads = uploadResults.filter((result): result is PromiseRejectedResult => 
        result.status === 'rejected'
      );
      
      if (failedUploads.length > 0) {
        // Cleanup any successfully uploaded new images
        const successfulUrls = uploadResults
          .filter((result): result is PromiseFulfilledResult<string> => 
            result.status === 'fulfilled'
          )
          .map(result => result.value);
        
        await cleanupCloudinaryImages(successfulUrls);
        
        return { 
          success: false, 
          message: "Failed to upload some new images. Please try again." 
        };
      }

      newUrls.push(...uploadResults
        .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
        .map(result => result.value)
      );
    }

    // Combine all images
    const allUrls = [...prevImages, ...newUrls];

    // Update database
    const { error: updateError } = await supabase
      .from("displays")
      .update({
        title: title.trim(),
        images: allUrls,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      // Rollback: Delete newly uploaded images if update fails
      await cleanupCloudinaryImages(newUrls);
      
      console.error("Database update error:", updateError);
      return { 
        success: false, 
        message: "Failed to update display. Please try again." 
      };
    }

    // Cleanup old images that were removed (if any)
    const removedImages = existingDisplay.images.filter((img: string) => !prevImages.includes(img));
    await cleanupCloudinaryImages(removedImages);

    // Revalidate the displays page
    revalidatePath("/dashboard/displays");

    return {
      success: true,
      message: "Display updated successfully",
    };
  } catch (error: any) {
    console.error("Unexpected error in updateDisplayAction:", error);
    return { 
      success: false, 
      message: error.message || "An unexpected error occurred. Please try again." 
    };
  }
}

export async function deleteDisplay(formData: FormData): Promise<{
  success: boolean;
  message: string;
}> {
  const id = formData.get("id") as string;

  if (!id) {
    return { success: false, message: "Display ID is required" };
  }

  const supabase = await supabaseServer();

  try {
    // Validate authentication
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    if (authError) return { success: false, message: "Authentication failed. Please sign in again." };
    
    if (!userData.user) return { success: false, message: "Not authenticated. Please sign in." };

    // Check if display exists and belongs to user
    const { data: existingDisplay, error: fetchError } = await supabase
      .from("displays")
      .select("images, user_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") return { success: false, message: "Display not found" }
      return { success: false, message: "Failed to fetch display data" };
    }

    if (existingDisplay.user_id !== userData.user.id)  return { success: false, message: "You are not authorized to delete this display" };

    // Delete images from Cloudinary
    if (existingDisplay.images?.length) {
      try {
        await cleanupCloudinaryImages(existingDisplay.images);
      } catch (cloudinaryError) {
        console.error("Cloudinary cleanup error:", cloudinaryError);
        // Continue with database deletion even if Cloudinary cleanup fails
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("displays")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Database delete error:", deleteError);
      return { 
        success: false, 
        message: "Failed to delete display from database. Please try again." 
      };
    }

    // Revalidate the displays page
    revalidatePath("/dashboard/displays");

    return { 
      success: true, 
      message: "Display deleted successfully" 
    };
  } catch (error: any) {
    console.error("Unexpected error in deleteDisplayAction:", error);
    return { 
      success: false, 
      message: error.message || "An unexpected error occurred. Please try again." 
    };
  }
}