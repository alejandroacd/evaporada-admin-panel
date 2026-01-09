// app/dashboard/portraits/page.tsx
import { supabaseServer } from "@/lib/server";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { UploadZone } from "./components/UploadZone";
import { Suspense } from "react";
import { DragAndDropPortraits } from "./components/DragAndDropPortraits";

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

      {/* Images Grid con Drag & Drop */}
      {portraits?.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No portraits yet.</p>
          <p className="text-gray-400 mt-2">Upload your first image above</p>
        </div>
      ) : (
        <DragAndDropPortraits initialPortraits={portraits || []} />
      )}
    </div>
  );
}