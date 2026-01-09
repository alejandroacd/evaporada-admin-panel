// app/dashboard/publications/page.tsx
import { supabaseServer } from "@/lib/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DragAndDropPublications } from "./components/DragAndDropPublications";

export default async function PublicationsPage() {
  const supabase = await supabaseServer();

  // Ordenar por sort_order si existe, sino por created_at
  const { data: publications } = await supabase
    .from("publications")
    .select("*")
    .order("order", { ascending: true, nullsFirst: false })
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

      <DragAndDropPublications initialPublications={publications || []} />
    </div>
  );
}