import { supabaseServer } from "@/lib/server";
import EditDisplay from "../components/EditDisplayClient";

export default async function EditDisplayPage({ params }: { params: { id: string } }) {
  const supabase = await supabaseServer();
  const { id } = await params
  const { data, error } = await supabase
    .from("displays")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return <p className="text-red-500">Display not found</p>;
  }

  return <EditDisplay display={data} />;
}
