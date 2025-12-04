// app/dashboard/displays/edit/edit-display-form.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateDisplayAction } from "../actions";
import { toast } from "sonner";
import BackButton from "@/components/ui/go-back";
import ImageUploaderGrid from "@/components/image-uploader-grid";
import { Loader2 } from "lucide-react";
import { ImageItem } from "@/hooks/useImageUploader";
import { useRouter } from "next/navigation";

interface DisplayData {
  id: string;
  title: string;
  images: string[];
}

export default function EditDisplay({ display }: { display: DisplayData }) {
  const router = useRouter();
  const [title, setTitle] = useState(display.title);
  const [images, setImages] = useState<ImageItem[]>(display.images || []);
  const [isPending, startTransition] = useTransition();

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image instanceof File) {
          URL.revokeObjectURL(URL.createObjectURL(image));
        }
      });
    };
  }, [images]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    if (images.length === 0) {
      toast.error("Please keep at least one image");
      return;
    }

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (title.length > 200) {
      toast.error("Title must be less than 200 characters");
      return;
    }

    const formData = new FormData();
    formData.append("id", display.id);
    formData.append("title", title.trim());
    
    // Separate existing URLs from new Files
    const existingImages = images.filter(img => typeof img === "string");
    const newFiles = images.filter(img => img instanceof File);
    
    formData.append("prevImages", JSON.stringify(existingImages));
    
    // Append only new File objects (not the existing URLs)
    newFiles.forEach((file) => {
      if (file instanceof File) {
        formData.append("images", file);
      }
    });

    startTransition(async () => {
      try {
        const result = await updateDisplayAction(formData);

        if (result.success) {
          toast.success(result.message);
          router.refresh(); // Refresh the page to show updated data
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  };

  const handleReset = () => {
    setTitle(display.title);
    setImages(display.images || []);
  };

  // Calculate stats for display
  const existingImagesCount = images.filter(img => typeof img === "string").length;
  const newFilesCount = images.filter(img => img instanceof File).length;
  const stats = {
    total: images.length,
    existing: existingImagesCount,
    new: newFilesCount,
    remainingSlots: 10 - images.length,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div>
        <BackButton />
        <h1 className="font-bold text-3xl mt-4">Edit Display</h1>
        <p className="text-gray-500 mt-1">Update your display images and title</p>
      </div>

      <div className="space-y-2">
        <label className="block font-medium">Title *</label>
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          required 
          placeholder="Enter display title"
          maxLength={200}
        />
        <p className="text-sm text-gray-500">Max 200 characters</p>
      </div>

      <div className="space-y-2">
        <label className="block font-medium">
          Images *
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({stats.existing} existing, {stats.new} new)
          </span>
        </label>
        
        <ImageUploaderGrid 
          images={images}
          setImages={setImages}
          maxImages={10}
          onError={(errors) => {
            if (errors.length > 0) {
              toast.error(errors[0]);
            }
          }}
        />
        
        {/* Display stats for debugging (optional) */}
        <div className="text-xs text-gray-500 mt-2">
          <p>Total images: {stats.total}</p>
          <p>Existing URLs: {stats.existing}</p>
          <p>New Files: {stats.new}</p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={isPending || images.length === 0}
          className="min-w-[120px]"
        >
          {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Changes"}
        </Button>
        
        <Button 
          type="button" 
          variant="outline"
          onClick={handleReset}
        >
          Reset
        </Button>
        
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.back()}
          className="ml-auto"
        >
          Cancel
        </Button>
      </div>

      {/* Hidden field for ID */}
      <input type="hidden" name="id" value={display.id} />
    </form>
  );
}