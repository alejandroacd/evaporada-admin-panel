// app/dashboard/portraits/components/PortraitCard.tsx
'use client';

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deletePortrait } from "../actions";

interface Portrait {
  id: string | number;
  image_url: string;
  order: number;
  created_at: string;
}

interface PortraitCardProps {
  portrait: Portrait;
}

export function PortraitCard({ portrait }: PortraitCardProps) {
  return (
    <div className="group relative rounded-lg border bg-white shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 aspect-square">
      {/* Portrait Image */}
      <div className="relative w-full h-full bg-gray-100">
        <Image
          src={portrait.image_url}
          alt={`Portrait ${portrait.id}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
        />

        {/* Delete Button Overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <form action={deletePortrait}>
            <input type="hidden" name="id" value={portrait.id} />
            <input type="hidden" name="image_url" value={portrait.image_url} />
            <Button
              type="submit"
              size="sm"
              variant="destructive"
              className="h-8 w-8 p-0 rounded-full shadow-lg"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Order Badge */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
          {portrait.order}
        </div>
      </div>
    </div>
  );
}