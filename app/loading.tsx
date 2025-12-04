import { Loader2 } from "lucide-react";

export default function Loading() {
    return <div className="flex justify-center items-center min-h-screen flex-col gap-2">
        <Loader2 className="animate-spin" />
        <p>Loading</p>
    </div>
}