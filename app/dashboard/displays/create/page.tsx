// app/dashboard/displays/create/create-display-form.tsx
"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageUploaderGrid from "@/components/image-uploader-grid";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import BackButton from "@/components/ui/go-back";
import { ImageItem } from "@/hooks/useImageUploader";
import { createDisplay } from "@/utils/displays";

export default function CreateDisplayForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [images, setImages] = useState<ImageItem[]>([]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    if (images.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    // Check title
    const title = (e.currentTarget.elements.namedItem("title") as HTMLInputElement)?.value?.trim();
    if (!title) {
      toast.error("Title is required");
      return;
    }

    if (title.length > 200) {
      toast.error("Title must be less than 200 characters");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Only append files that are File objects (not strings)
    images.forEach((image) => {
      if (image instanceof File) {
        formData.append("images", image);
      }
    });

    startTransition(async () => createDisplay({formData, router}));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div>
        <BackButton />
        <h1 className="font-bold text-3xl mt-4">Create Display</h1>
      </div>

      <div className="space-y-2">
        <label className="block font-medium">Title *</label>
        <Input 
          name="title" 
          required 
          placeholder="Enter display title"
          maxLength={200}
        />
        <p className="text-sm text-gray-500">Max 200 characters</p>
      </div>

      <div className="space-y-2">
        <label className="block font-medium">Images *</label>
        {/* Grid receives current images and can update them */}
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
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={pending || images.length === 0}
          className="min-w-[120px]"
        >
          {pending ? <Loader2 className="animate-spin h-4 w-4" /> : "Create Display"}
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}