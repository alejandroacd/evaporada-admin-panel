// hooks/use-image-uploader.ts
import { useState, useCallback, useRef, useMemo } from "react";

export type ImageItem = File | string;

interface UseImageUploaderProps {
  initialImages?: ImageItem[];
  maxImages?: number;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
}

export function useImageUploader({
  initialImages = [],
  maxImages = 10,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
}: UseImageUploaderProps = {}) {
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get image source URL for display
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
      const sizeInKB = image.size / 1024;
      if (sizeInKB > 1024) {
        return `${(sizeInKB / 1024).toFixed(1)} MB`;
      }
      return `${Math.round(sizeInKB)} KB`;
    }
    return 'Uploaded';
  }, [isNewImage]);

  // Validate a single file
  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxFileSize) {
      const sizeInMB = maxFileSize / (1024 * 1024);
      return `"${file.name}" exceeds ${sizeInMB}MB limit`;
    }
    
    if (!allowedTypes.includes(file.type)) {
      return `"${file.name}" has unsupported type. Allowed: ${allowedTypes.join(", ")}`;
    }
    
    return null;
  }, [maxFileSize, allowedTypes]);

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

    // Update errors
    setErrors(validationErrors);

    if (validFiles.length === 0) {
      return;
    }

    // Check if adding new files exceeds max limit
    const currentCount = images.length;
    const availableSlots = maxImages - currentCount;
    
    if (validFiles.length > availableSlots) {
      setErrors(prev => [
        ...prev,
        `Cannot add ${validFiles.length} files. Only ${availableSlots} slots available.`
      ]);
      validFiles.splice(availableSlots);
    }

    // Add valid files
    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [images.length, maxImages, validateFile]);

  // Remove an image
  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const removedImage = newImages[index];
      
      // Revoke object URL if it's a File
      if (removedImage instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(removedImage));
      }
      
      newImages.splice(index, 1);
      return newImages;
    });
  }, []);

  // Remove all images
  const clearAll = useCallback(() => {
    // Revoke all object URLs
    images.forEach(image => {
      if (image instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(image));
      }
    });
    setImages([]);
    setErrors([]);
  }, [images]);

  // Open file dialog
  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  // Get separated images using useMemo for performance
  const { existingImages, newFiles } = useMemo(() => {
    const existing: string[] = [];
    const newFiles: File[] = [];
    
    images.forEach(image => {
      if (typeof image === "string") {
        existing.push(image);
      } else {
        newFiles.push(image);
      }
    });
    
    return { existingImages: existing, newFiles };
  }, [images]);

  // Get image statistics
  const stats = useMemo(() => ({
    total: images.length,
    existing: existingImages.length,
    new: newFiles.length,
    remainingSlots: maxImages - images.length,
  }), [images.length, existingImages.length, newFiles.length, maxImages]);

  // Cleanup object URLs on unmount
  const cleanup = useCallback(() => {
    images.forEach(image => {
      if (image instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(image));
      }
    });
  }, [images]);

  return {
    // State
    images,
    errors,
    inputRef,
    
    // Stats
    stats,
    existingImages,
    newFiles,
    
    // Actions
    setImages,
    handleSelectImages,
    removeImage,
    clearAll,
    openFileDialog,
    cleanup,
    
    // Helpers
    getImageSrc,
    getImageName,
    isNewImage,
    getFileSize,
    
    // Validation
    hasErrors: errors.length > 0,
    isValid: images.length > 0 && errors.length === 0,
  };
}