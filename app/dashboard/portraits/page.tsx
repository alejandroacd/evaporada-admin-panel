import { supabaseServer } from "@/lib/server";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Trash2, Upload, X } from "lucide-react";
import { deletePortrait } from "./actions";
import { UploadZone } from "./components/UploadZone";
import { Suspense } from "react";

export default async function PortraitsPage() {
  const supabase = await supabaseServer();
  const { data: portraits } = await supabase
    .from("portraits")
    .select("*")
    .order("order", { ascending: true });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Portraits</h1>
          <p className="text-gray-600 mt-2">
            Upload and manage your portrait images
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {portraits?.length || 0} images
          </span>
        </div>
      </div>

      {/* Upload Zone */}
      <Suspense fallback={<div>Loading upload...</div>}>
        <UploadZone />
      </Suspense>

      {/* Images Grid */}
      {portraits?.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No portraits yet.</p>
          <p className="text-gray-400 mt-2">Upload your first image above</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {portraits?.map((portrait) => (
            <div
              key={portrait.id}
              className="group relative rounded-lg border bg-white shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 aspect-square"
            >
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
          ))}
        </div>
      )}
    </div>
  );
}