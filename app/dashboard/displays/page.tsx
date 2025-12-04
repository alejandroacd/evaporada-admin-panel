import { supabaseServer } from "@/lib/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/app/dashboard/displays/components/DeleteButton";

export default async function DisplaysPage() {
  const supabase = await supabaseServer();

  const { data: displays } = await supabase
    .from("displays")
    .select("*")
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

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {displays?.map((disp) => (
          <div
            key={disp.id}
            className="rounded-xl border bg-white shadow-sm overflow-hidden hover:shadow-lg transition"
          >
            {/* IMAGE */}
            {disp.images?.length > 0 ? (
              <div className="relative w-full h-48 bg-gray-100">
                <Image
                  src={disp.images[0]}
                  alt={disp.title}
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
              <h2 className="text-xl font-semibold">{disp.title}</h2>
              <div className="mt-4 gap-2 flex justify-end items-center">
                {/* EDIT */}
                <Link href={`/dashboard/displays/${disp.id}`}>
                  <Button size="sm" variant="outline">
                    <Pencil />
                  </Button>
                </Link>

                {/* DELETE */}
                <form >
                  <input type="hidden" name="id" value={disp.id} />
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
