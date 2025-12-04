"use client";

import { useState, useTransition } from "react";
import ImageUploaderGrid from "../../../../components/image-uploader-grid";
import { updatePublication } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BackButton from "@/components/ui/go-back";
import { toast } from "sonner";
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react";
import { ImageItem } from "@/hooks/useImageUploader";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    
    formData.append("id", publication.id);
    formData.append("title", title);
    formData.append("description", description);

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
          toast.success("Publication updated!");
          router.push("/dashboard/publications");
          router.refresh(); // <-- IMPORTANTE: Refrescar los datos
        } else {
          toast.error("Error updating publication");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error updating publication");
      }
    });
  };

  return (
    <div className="max-w-xl space-y-6 mx-auto">
      <BackButton />
      <h1 className="text-3xl font-semibold">Edit Publication</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="font-medium">Title</label>
          <Input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="font-medium">Description</label>
          <Textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
        </div>

        <div>
          <label className="font-medium">Images</label>
          <ImageUploaderGrid 
            images={allImages} 
            setImages={setAllImages} 
          />
        </div>
        
        <div className="w-full flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin h-4 w-4" /> : "Update"}
          </Button>
        </div>
      </form>
    </div>
  );
}