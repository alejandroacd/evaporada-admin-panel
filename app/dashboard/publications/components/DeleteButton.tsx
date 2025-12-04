"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2, Trash } from "lucide-react";

export function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="destructive"
      size="sm"
      disabled={pending}
      className="flex items-center gap-2"
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin h-4 w-4" />
        </>
      ) : (
        <Trash className="h-4 w-4" />
      )}
    </Button>
  );
}
