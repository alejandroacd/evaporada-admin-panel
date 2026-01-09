// app/dashboard/publications/components/PublicationCard.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { DeleteButton } from "./DeleteButton";
import TipTapRenderer from "@/components/tip-tap-renderer";
import { Publication } from "@/types";
import { deletePublication } from "../actions";

interface PublicationCardProps {
  publication: Publication;
}

export function PublicationCard({ publication }: PublicationCardProps) {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden hover:shadow-lg transition">
      {publication.images?.length > 0 ? (
        <div className="relative w-full h-48 bg-gray-100">
          <Image
            src={publication.images[0]}
            alt={publication.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
          No image
        </div>
      )}

      <div className="p-4">
        <h2 className="text-xl font-semibold">{publication.title}</h2>
        <div className="text-gray-600 mt-2 line-clamp-3 min-h-[72px]">
          <TipTapRenderer 
            html={publication.description || ""} 
            maxLength={150}
            className="text-sm"
          />
        </div>

        <div className="mt-4 gap-2 flex justify-end items-center">
          <Link href={`/dashboard/publications/${publication.id}`}>
            <Button size="sm" variant="outline">
              <Pencil />
            </Button>
          </Link>

          <form action={deletePublication}>
            <input type="hidden" name="id" value={publication.id} />
            <DeleteButton />
          </form>
        </div>
      </div>
    </div>
  );
}