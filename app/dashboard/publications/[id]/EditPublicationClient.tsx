"use client";

import { useState, useTransition, useEffect } from "react";
import ImageUploaderGrid from "@/components/image-uploader-grid";
import { updatePublication } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BackButton from "@/components/ui/go-back";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ImageItem } from "@/hooks/useImageUploader";
import { RichTextEditor } from "../components/RichTextEditor"; // Asegúrate de que esta ruta sea correcta

interface Publication {
  id: string;
  title: string;
  description: string;
  images: string[];
}

export default function EditPublicationClient({ publication }: { publication: Publication }) {
  const [allImages, setAllImages] = useState<ImageItem[]>(publication.images || []);
  const [title, setTitle] = useState(publication.title);
  const [description, setDescription] = useState(publication.description || "");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  // Asegurarse de que las imágenes sean strings (URLs existentes)
  useEffect(() => {
    if (publication.images && publication.images.length > 0) {
      // Convertir las URLs de imágenes existentes en strings para ImageUploaderGrid
      const imageUrls = publication.images.map(img => img.toString());
      setAllImages(imageUrls);
    }
  }, [publication.images]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validación
    if (allImages.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const formData = new FormData();
    
    formData.append("id", publication.id);
    formData.append("title", title);
    
    // Usar la descripción del estado (que viene de RichTextEditor)
    if (description && description.trim() !== "" && description.trim() !== "<p></p>") {
      formData.append("description", description);
    } else {
      formData.append("description", "");
    }

    // Separar imágenes existentes (strings) de nuevas (Files)
    const existingImages: string[] = [];
    const newFiles: File[] = [];

    allImages.forEach((img) => {
      if (typeof img === "string") {
        existingImages.push(img); // URLs existentes
      } else if (img instanceof File) {
        newFiles.push(img); // Nuevos archivos
      }
    });

    // IMPORTANTE: Enviar las imágenes existentes como JSON
    formData.append("existingImages", JSON.stringify(existingImages));
    
    // Enviar nuevas imágenes como archivos
    newFiles.forEach((file) => {
      formData.append("images", file);
    });

    startTransition(async () => {
      try {
        const result = await updatePublication(formData);

        if (result.success) {
          toast.success("Publication updated successfully!");
          router.push("/dashboard/publications");
          router.refresh(); // Refrescar los datos
        } else {
          toast.error(result.message || "Error updating publication");
        }
      } catch (error: any) {
        console.error("Error:", error);
        toast.error(error?.message || "Error updating publication");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div>
        <BackButton />
        <h1 className="font-bold text-3xl mt-4">Edit Publication</h1>
      </div>

      <div className="space-y-2">
        <label className="block font-medium">Title *</label>
        <Input 
          name="title" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
          images={allImages} 
          setImages={setAllImages}
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
          disabled={pending || allImages.length === 0}
          className="min-w-[120px]"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : "Update"}
        </Button>
      </div>
    </form>
  );
}