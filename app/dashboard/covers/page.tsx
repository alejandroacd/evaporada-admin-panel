import { CoverGrid } from "@/app/dashboard/covers/components/cover-grid";

export default async  function CoversPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Manage Covers</h1>
        <p className="text-gray-500 mt-2">
          Upload or replace cover images for each section
        </p>
      </div>
      
      <CoverGrid />
    </div>
  );
}