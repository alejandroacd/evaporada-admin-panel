
import BackButton from "@/components/ui/go-back";
import { CreatePublicationForm } from "./form";
export default async function CreatePublicationPage() {
  return (
    <div className="max-w-xl  mx-auto mt-10 space-y-8">
     <CreatePublicationForm />
    </div>
  );
}
