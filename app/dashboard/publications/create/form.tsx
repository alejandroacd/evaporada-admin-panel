"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPublication } from "../actions";
import ImageUploaderGrid from "../../../../components/image-uploader-grid";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ImageItem } from "@/hooks/useImageUploader";
import BackButton from "@/components/ui/go-back";

export function CreatePublicationForm() {
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

    startTransition(async () => {
      try {
        const result = await createPublication(formData);

        if (result.success) {
          toast.success("Publication created successfully");
          router.push("/dashboard/publications");
        } else {
          toast.error(result.message);
        }
      } catch (err: any) {
        toast.error(err?.message || "Something went wrong. Please try again");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div>
        <BackButton />
        <h1 className="font-bold text-3xl mt-4">Create Publication</h1>
      </div>

      <div className="space-y-2">
        <label className="block font-medium">Title *</label>
        <Input 
          name="title" 
          required 
          placeholder="Enter publication title"
          maxLength={200}
        />
        <p className="text-sm text-gray-500">Max 200 characters</p>
      </div>

      <div className="space-y-2">
        <label className="block font-medium">Description</label>
        <Textarea 
          name="description" 
          rows={5} 
          placeholder="Enter publication description (optional)"
        />
      </div>

      <div className="space-y-2">
        <label className="block font-medium">Images *</label>
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

      <div className="flex gap-3 pt-4 w-full justify-end">
        
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
     <Button 
          type="submit" 
          disabled={pending || images.length === 0}
          className="min-w-[120px]"
        >
          {pending ? "Saving..." : "Save"}
        </Button>
     
      </div>
    </form>
  );
}