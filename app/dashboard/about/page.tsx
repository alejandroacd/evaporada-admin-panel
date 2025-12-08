// app/dashboard/about/page.tsx
import AboutEditor from "./components/about-editor";
import { getLatestAbout } from "./actions";

export default async function AboutPage() {
  // Obtener el último registro de about
  const result = await getLatestAbout();
  
  let initialData = {};
  
  if (result.success && result.data) {
    initialData = result.data;
  } else if (!result.success) {
    console.error("Error loading about data:", result.error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AboutEditor 
        initialData={initialData} 
      />
    </div>
  );
}