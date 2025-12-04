"use client";

import { ImageItem } from "@/hooks/useImageUploader";
import ImageUploaderGrid from "../../../../components/image-uploader-grid";
import { useState } from "react";

export default function EditImageSelector({ defaultImages }: { defaultImages: string[] }) {
  const [newImages, setNewImages] = useState<ImageItem[]>([]);

  return (
    <div className="space-y-4">
      {/* Imágenes actuales que ya están subidas */}
      <div>
        <label className="font-medium">Current Images</label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {defaultImages.map((url) => (
            <img key={url} src={url} className="rounded border" />
          ))}
        </div>
      </div>

      {/* Grid interactivo para nuevas imágenes */}
      <div>
        <label className="font-medium">Add new images</label>

        <ImageUploaderGrid images={newImages} setImages={setNewImages} />

        {/* IMPORTANT: Pasar las imágenes por formulario */}
        {newImages.map((file, i) => (
          <input
            key={i}
            type="hidden"
            name="new_images"
            value={file instanceof File ? file.name : file}
          />
        ))}
      </div>
    </div>
  );
}
