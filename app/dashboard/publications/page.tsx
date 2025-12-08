import { supabaseServer } from "@/lib/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { deletePublication } from "./actions";
import { DeleteButton } from "./components/DeleteButton";
import TipTapRenderer from "@/components/tip-tap-renderer"; // Asegúrate de que esta ruta sea correcta

export default async function PublicationsPage() {
  const supabase = await supabaseServer();

  const { data: publications } = await supabase
    .from("publications")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Publications</h1>

        <Link href="/dashboard/publications/create">
          <Button>New Publication</Button>
        </Link>
      </div>

      {publications?.length === 0 && (
        <p className="text-gray-500 text-lg">No publications yet.</p>
      )}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {publications?.map((pub) => (
          <div
            key={pub.id}
            className="rounded-xl border bg-white shadow-sm overflow-hidden hover:shadow-lg transition"
          >
            {/* IMAGE */}
            {pub.images?.length > 0 ? (
              <div className="relative w-full h-48 bg-gray-100">
                <Image
                  src={pub.images[0]}
                  alt={pub.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                No image
              </div>
            )}

            {/* CONTENT */}
            <div className="p-4">
              <h2 className="text-xl font-semibold">{pub.title}</h2>

              <div className="text-gray-600 mt-2 line-clamp-3 min-h-[72px]">
                <TipTapRenderer 
                  html={pub.description || ""} 
                  maxLength={150}
                  className="text-sm"
                />
              </div>

              <div className="mt-4 gap-2 flex justify-end items-center">
                {/* EDIT */}
                <Link href={`/dashboard/publications/${pub.id}`}>
                  <Button size="sm" variant="outline">
                    <Pencil />
                  </Button>
                </Link>

                {/* DELETE */}
                <form action={deletePublication}>
                  <input type="hidden" name="id" value={pub.id} />
                  <DeleteButton />
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}