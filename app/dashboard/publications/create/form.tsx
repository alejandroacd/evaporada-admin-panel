"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPublication } from "../actions";
import ImageUploaderGrid from "../../../../components/image-uploader-grid";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ImageItem } from "@/hooks/useImageUploader";
import BackButton from "@/components/ui/go-back";
import { RichTextEditor } from "../components/RichTextEditor";

export function CreatePublicationForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [description, setDescription] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validación del lado del cliente
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

    // Establecer el título
    formData.set("title", title);

    // Establecer la descripción (puede estar vacía o contener HTML)
    if (description && description.trim() !== "" && description.trim() !== "<p></p>") {
      formData.set("description", description);
    } else {
      formData.set("description", "");
    }

    // Agregar solo archivos que sean objetos File (no strings)
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
        <RichTextEditor 
          value={description}
          onChange={setDescription}
          placeholder="Enter publication description (optional)"
        />
        {/* Campo oculto para enviar la descripción */}
        <input type="hidden" name="description" value={description} />
        <p className="text-sm text-gray-500">
          Supports <strong>bold</strong>, <em>italic</em>, <s>strikethrough</s>, links, and lists
        </p>
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
        <p className="text-sm text-gray-500">Supported formats: JPG, PNG, WebP, GIF - Max 5MB each</p>
      </div>

      <div className="flex gap-3 pt-4 w-full justify-end">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.back()}
          disabled={pending}
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