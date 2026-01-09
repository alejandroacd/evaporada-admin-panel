// app/dashboard/displays/components/DisplayCard.tsx
'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { DeleteButton } from "./DeleteButton";
import { deleteDisplay } from "../actions";

interface Display {
  id: string | number;
  title: string;
  images: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
  order?: number;
}

interface DisplayCardProps {
  display: Display;
}

export function DisplayCard({ display }: DisplayCardProps) {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden hover:shadow-lg transition">
      {/* IMAGE */}
      {display.images?.length > 0 ? (
        <div className="relative w-full h-48 bg-gray-100">
          <Image
            src={display.images[0]}
            alt={display.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
          No image
        </div>
      )}

      {/* CONTENT */}
      <div className="p-4">
        <h2 className="text-xl font-semibold">{display.title}</h2>
        
        <div className="mt-4 gap-2 flex justify-end items-center">
          {/* EDIT */}
          <Link href={`/dashboard/displays/${display.id}`}>
            <Button size="sm" variant="outline">
              <Pencil />
            </Button>
          </Link>

          {/* DELETE */}
          <form action={async (formData) => {
            await deleteDisplay(formData);
          }}>
            <input type="hidden" name="id" value={display.id} />
            <DeleteButton />
          </form>
        </div>
      </div>
    </div>
  );
}