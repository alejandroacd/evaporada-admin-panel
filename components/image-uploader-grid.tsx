// components/image-uploader-grid.tsx
"use client";

import { X } from "lucide-react";
import { ImageItem } from "@/hooks/useImageUploader";
import { useRef, useCallback } from "react";

interface ImageUploaderGridProps {
  images: ImageItem[];
  setImages: (images: ImageItem[]) => void;
  maxImages?: number;
  onError?: (errors: string[]) => void;
  showStats?: boolean;
}

export default function ImageUploaderGrid({
  images,
  setImages,
  maxImages = 10,
  onError,
  showStats = true,
}: ImageUploaderGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate stats
  const existingImages = images.filter(img => typeof img === "string");
  const newFiles = images.filter(img => img instanceof File);
  const stats = {
    total: images.length,
    existing: existingImages.length,
    new: newFiles.length,
    remainingSlots: maxImages - images.length,
  };

  // Get image source URL
  const getImageSrc = useCallback((image: ImageItem): string => {
    if (typeof image === "string") {
      return image;
    }
    return URL.createObjectURL(image);
  }, []);

  // Get image name
  const getImageName = useCallback((image: ImageItem, index: number): string => {
    if (typeof image === "string") {
      const urlParts = image.split("/");
      return urlParts[urlParts.length - 1] || `image-${index + 1}`;
    }
    return image.name;
  }, []);

  // Check if image is a new File
  const isNewImage = useCallback((image: ImageItem): image is File => {
    return image instanceof File;
  }, []);

  // Get file size if it's a File
  const getFileSize = useCallback((image: ImageItem): string => {
    if (isNewImage(image)) {
      const sizeInKB = (image as File).size / 1024;
      if (sizeInKB > 1024) {
        return `${(sizeInKB / 1024).toFixed(1)} MB`;
      }
      return `${Math.round(sizeInKB)} KB`;
    }
    return 'Uploaded';
  }, []);

  // Validate a single file
  const validateFile = useCallback((file: File): string | null => {
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    
    if (file.size > maxFileSize) {
      const sizeInMB = maxFileSize / (1024 * 1024);
      return `"${file.name}" exceeds ${sizeInMB}MB limit`;
    }
    
    if (!allowedTypes.includes(file.type)) {
      return `"${file.name}" has unsupported type. Allowed: ${allowedTypes.join(", ")}`;
    }
    
    return null;
  }, []);

  // Remove an image
  const handleRemoveImage = useCallback((index: number) => {
    const newImages = [...images];
    const removedImage = newImages[index];
    
    // Revoke object URL if it's a File
    if (removedImage instanceof File) {
      URL.revokeObjectURL(URL.createObjectURL(removedImage));
    }
    
    newImages.splice(index, 1);
    setImages(newImages);
  }, [images, setImages]);

  // Clear all images
  const handleClearAll = useCallback(() => {
    // Revoke all object URLs
    images.forEach(image => {
      if (image instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(image));
      }
    });
    setImages([]);
  }, [images, setImages]);

  // Handle file selection
  const handleSelectImages = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    // Validate each file
    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    // Check if adding new files exceeds max limit
    const currentCount = images.length;
    const availableSlots = maxImages - currentCount;
    
    if (validFiles.length > availableSlots) {
      validationErrors.push(
        `Cannot add ${validFiles.length} files. Only ${availableSlots} slots available.`
      );
      validFiles.splice(availableSlots);
    }

    // Add valid files
    if (validFiles.length > 0) {
      setImages([...images, ...validFiles]);
    }

    // Notify parent about errors
    if (onError && validationErrors.length > 0) {
      onError(validationErrors);
    }

    // Reset input
    e.target.value = "";
  }, [images, maxImages, validateFile, setImages, onError]);

  // Open file dialog
  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleSelectImages}
      />

      {/* Images Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {images.map((image, idx) => (
          <div key={idx} className="relative group">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-sm">
              <img
                src={getImageSrc(image)}
                alt={getImageName(image, idx)}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='12'%3EImage%3C/text%3E%3C/svg%3E`;
                }}
              />
              
              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500 hover:text-white shadow-lg transform hover:scale-110"
                aria-label={`Remove ${getImageName(image, idx)}`}
              >
                <X size={14} />
              </button>
              
              {/* Image info overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-xs font-medium truncate">{getImageName(image, idx)}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs opacity-75">
                    {getFileSize(image)}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${isNewImage(image) ? 'bg-blue-500' : 'bg-green-500'}`}>
                    {isNewImage(image) ? 'New' : 'Existing'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Image Button */}
        {stats.remainingSlots > 0 && (
          <button
            type="button"
            onClick={openFileDialog}
            className="aspect-square w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center mb-2 transition">
              <span className="text-2xl">＋</span>
            </div>
            <span className="text-sm font-medium">Add Image</span>
            <span className="text-xs text-gray-400 mt-1">
              {stats.remainingSlots} slot{stats.remainingSlots !== 1 ? 's' : ''} left
            </span>
          </button>
        )}
      </div>

      {/* Stats and Controls */}
      {showStats && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{stats.total}/{maxImages}</span> images
              <span className="mx-2">•</span>
              <span className="text-green-600">{stats.existing} existing</span>
              <span className="mx-2">|</span>
              <span className="text-blue-600">{stats.new} new</span>
            </p>
            <p className="text-xs text-gray-500">
              Supported: JPG, PNG, WebP, GIF • Max 5MB each
            </p>
          </div>
          
          {stats.total > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClearAll}
                className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded border border-red-200 hover:border-red-300 transition"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={openFileDialog}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded border border-blue-200 hover:border-blue-300 transition"
                disabled={stats.remainingSlots === 0}
              >
                Add More
              </button>
            </div>
          )}
        </div>
      )}

      {/* Validity Indicator */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${images.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
        <span className={images.length > 0 ? 'text-green-600' : 'text-gray-500'}>
          {images.length > 0 ? 'Ready to submit' : 'Add at least one image'}
        </span>
      </div>
    </div>
  );
}