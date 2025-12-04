import { createDisplayAction, updateDisplayAction } from "@/app/dashboard/displays/actions";
import { toast } from "sonner";
interface createDisplayFunction {
    formData: FormData,
    router: any,
}
export  async function createDisplay({formData, router}: createDisplayFunction) {
     try {
        const result = await createDisplayAction(formData);

        if (result.success) {
          toast.success(result.message);
          router.push("/dashboard/displays");
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
}

export  async function updateDisplay(formData: FormData) {
         const res = await updateDisplayAction(formData);

      if (res?.success) {
        toast("Display updated successfully");
      } else {
        toast("Error updating display");
      }
}