"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

interface DeleteButtonProps {
  variant?: "icon" | "text";
  size?: "sm" | "default";
}

export function DeleteButton({ variant = "icon", size = "sm" }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsDeleting(true);
  };

  if (variant === "text") {
    return (
      <Button
        type="submit"
        variant="destructive"
        size={size}
        disabled={isDeleting}
        onClick={handleClick}
        className="flex items-center gap-2"
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        Delete
      </Button>
    );
  }

  return (
    <Button
      type="submit"
      variant="destructive"
      size={size}
      disabled={isDeleting}
      onClick={handleClick}
      className="h-8 w-8 p-0"
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}