"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  label?: string; // texto opcional
}

export default function BackButton({ label = "Back" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <Button variant="outline" size="sm" onClick={handleBack} className="flex items-center gap-2">
      <ArrowLeft size={16} />
      {label}
    </Button>
  );
}
