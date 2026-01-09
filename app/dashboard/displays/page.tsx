import { supabaseServer } from "@/lib/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DragAndDropDisplays } from "./components/DragAndDropDisplays";

export default async function DisplaysPage() {
  const supabase = await supabaseServer();

  // Ordenar por 'order' si existe, sino por created_at
  const { data: displays } = await supabase
    .from("displays")
    .select("*")
    .order("order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Displays</h1>

        <Link href="/dashboard/displays/create">
          <Button>New Display</Button>
        </Link>
      </div>

      {displays?.length === 0 && (
        <p className="text-gray-500 text-lg">No displays yet.</p>
      )}

      {/* Reemplazamos la grid estática por el componente drag and drop */}
      <DragAndDropDisplays initialDisplays={displays || []} />
    </div>
  );
}