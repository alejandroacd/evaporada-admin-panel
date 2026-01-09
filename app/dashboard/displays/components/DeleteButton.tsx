"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash } from "lucide-react";
import { deleteDisplay} from "../actions";
import { toast } from "sonner";

export function DeleteButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="submit"
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        const form = e.currentTarget.closest("form") as HTMLFormElement;

        const formData = new FormData(form);

        startTransition(async () => {
          const result = await deleteDisplay(formData);

          if (result.success) {
            toast.success("Display deleted");
            window.location.reload();
          } else {
            toast.error(result.message);
          }
        });
      }}
    >
      {pending ? <Loader2 className="animate-spin" /> : <Trash />}
    </Button>
  );
}
