"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, X } from "lucide-react";
import { uploadPortrait } from "../actions";

export function UploadZone() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setUploading(true);
    try {
      await uploadPortrait(formData);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const removePreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="flex items-center gap-4">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            name="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="portrait-upload"
          />
          
          {/* Upload button */}
          <label htmlFor="portrait-upload">
            <div className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 cursor-pointer transition-colors">
              <Upload className="h-4 w-4" />
              <span>Upload Portrait</span>
            </div>
          </label>

          {/* Submit button (only shows when file selected) */}
          {preview && (
            <Button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Save Image
                </>
              )}
            </Button>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
              onClick={removePreview}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* File info */}
        <p className="text-sm text-gray-500">
          Supports: JPG, PNG, WebP, GIF • Max 5MB each
        </p>
      </form>
    </div>
  );
}