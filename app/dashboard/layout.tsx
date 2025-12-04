import Link from "next/link";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Image, FileText, User } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const routes = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/publications", label: "Publications", icon: FileText },
    { href: "/dashboard/displays", label: "Displays", icon: Image },
    { href: "/dashboard/portraits", label: "Portraits", icon: Image },
    { href: "/dashboard/about", label: "About", icon: User },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 border-r bg-white p-6 space-y-6">
        <h2 className="scroll-m-20 text-center text-2xl font-light tracking-tight text-balance">[◉¯]  <strong>Evaporada</strong> Admin Panel</h2>

        <nav className="space-y-1">
          {routes.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              )}
            >
              <Icon className="mr-2 h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
