import { supabaseServer } from "@/lib/server";
import EditPublicationClient from "./EditPublicationClient";

export default async function EditPublicationPage({ params }: { params: { id: string }}) {
  const supabase = await supabaseServer();
  const { id } = await params;

  const { data: publication, error } = await supabase
    .from("publications")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !publication) {
    return <p className="text-red-500">Publication not found.</p>;
  }

  return <EditPublicationClient publication={publication} />;
}
