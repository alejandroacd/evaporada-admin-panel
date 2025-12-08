"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cover } from "../types";
import { updateCover } from "../actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CoverUploadFormProps {
  sectionId: string;
  sectionLabel: string;
  currentCover: Cover | undefined;
  onSuccess: () => void;
}

export function CoverUploadForm({ 
  sectionId, 
  sectionLabel, 
  currentCover, 
  onSuccess 
}: CoverUploadFormProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentCover?.image_url || "");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(currentCover?.title || sectionLabel);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        toast.error("Por favor selecciona un archivo de imagen");
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("La imagen debe ser menor a 5MB");
        return;
      }

      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file && !currentCover?.image_url) {
      toast.error("Por favor selecciona una imagen");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("section", sectionId);
    formData.append("title", title);
    
    if (file) {
      formData.append("image", file);
    }

    try {
      const result = await updateCover(formData);

      if (result.success) {
        toast.success(result.message);
        onSuccess();
        if (result.returnUrl) {
          router.refresh(); // Refrescar la página para ver los cambios
        }
      } else {
        toast.error(result.message);
      }
    } catch (err: any) {
      toast.error(err?.message || "Algo salió mal. Por favor intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Preview */}
      <div className="space-y-2">
        <Label>Vista previa</Label>
        <div className="h-48 w-full border rounded-lg overflow-hidden bg-gray-50">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400">
              No hay imagen seleccionada
            </div>
          )}
        </div>
      </div>

      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="title">Título (opcional)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`Ingresa un título para ${sectionLabel}`}
          maxLength={100}
        />
        <p className="text-xs text-gray-500">
          Déjalo vacío para usar el nombre de la sección
        </p>
      </div>

      {/* Input de archivo */}
      <div className="space-y-2">
        <Label htmlFor="image">Imagen *</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required={!currentCover?.image_url}
        />
        <p className="text-xs text-gray-500">
          JPG, PNG o WebP. Máx. 5MB. 
          {currentCover?.image_url && " Déjalo vacío para mantener la imagen actual."}
        </p>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={uploading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Subiendo...
            </>
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </div>
    </form>
  );
}