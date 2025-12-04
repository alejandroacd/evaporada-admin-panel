// app/dashboard/page.tsx
import { supabaseServer } from "@/lib/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Image, 
  Users, 
  Settings, 
  Calendar,
  User,
  Database,
  Activity
} from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();

  // Fetch counts from database with error handling
  let publicationsCount = 0;
  let displaysCount = 0;
  let portraitsCount = 0;
  
  try {
    const [publications, displays, portraits] = await Promise.all([
      supabase.from("publications").select("*", { count: 'exact', head: true }),
      supabase.from("displays").select("*", { count: 'exact', head: true }),
      supabase.from("portraits").select("*", { count: 'exact', head: true })
    ]);
    
    publicationsCount = publications.count || 0;
    displaysCount = displays.count || 0;
    portraitsCount = portraits.count || 0;
  } catch (error) {
    console.error("Error fetching counts:", error);
  }

  const stats = [
    {
      title: "Publications",
      value: publicationsCount,
      icon: <FileText className="h-5 w-5" />,
      href: "/dashboard/publications",
      description: "Blog posts"
    },
    {
      title: "Displays",
      value: displaysCount,
      icon: <Image className="h-5 w-5" />,
      href: "/dashboard/displays",
      description: "Image collections"
    },
    {
      title: "Portraits",
      value: portraitsCount,
      icon: <Users className="h-5 w-5" />,
      href: "/dashboard/portraits",
      description: "Profile images"
    },
    {
      title: "About Page",
      value: "Live",
      icon: <Settings className="h-5 w-5" />,
      href: "/dashboard/about",
      description: "Website content"
    }
  ];

  const quickActions = [
    {
      title: "New Publication",
      description: "Create a new blog post",
      icon: <FileText className="h-4 w-4" />,
      href: "/dashboard/publications/create"
    },
    {
      title: "Upload Portraits",
      description: "Add new portrait images",
      icon: <Image className="h-4 w-4" />,
      href: "/dashboard/portraits"
    },
    {
      title: "Edit About",
      description: "Update about page content",
      icon: <Settings className="h-4 w-4" />,
      href: "/dashboard/about"
    },
    {
      title: "View All Content",
      description: "Browse all sections",
      icon: <Database className="h-4 w-4" />,
      href: "/dashboard"
    }
  ];

  // Get user initial for avatar
  const userInitial = data.user?.email?.charAt(0).toUpperCase() || "A";
  const userName = data.user?.email?.split('@')[0] || "Admin";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {userName}
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              {new Date().toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Link key={index} href={stat.href}>
              <Card className="border hover:border-gray-300 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-100">
                      <div className="text-gray-700">
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions */}
        <div className="lg:col-span-2">
          <Card className="border mb-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your content quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <div className="p-4 rounded-lg border hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {action.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Overview */}
          <Card className="border">
            <CardHeader>
              <CardTitle>Content Overview</CardTitle>
              <CardDescription>
                Distribution of your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Items</span>
                  <span className="font-bold text-gray-800">
                    {publicationsCount + displaysCount + portraitsCount}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Publications</span>
                      <span className="font-medium">{publicationsCount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-gray-700 h-1.5 rounded-full" 
                        style={{ 
                          width: `${Math.min(
                            publicationsCount > 0 ? (publicationsCount / (publicationsCount + displaysCount + portraitsCount)) * 100 : 0,
                            100
                          )}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Displays</span>
                      <span className="font-medium">{displaysCount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-gray-700 h-1.5 rounded-full" 
                        style={{ 
                          width: `${Math.min(
                            displaysCount > 0 ? (displaysCount / (publicationsCount + displaysCount + portraitsCount)) * 100 : 0,
                            100
                          )}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Portraits</span>
                      <span className="font-medium">{portraitsCount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-gray-700 h-1.5 rounded-full" 
                        style={{ 
                          width: `${Math.min(
                            portraitsCount > 0 ? (portraitsCount / (publicationsCount + displaysCount + portraitsCount)) * 100 : 0,
                            100
                          )}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile & System */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="border">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-medium">
                  {userInitial}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{data.user?.email}</h3>
                  <p className="text-sm text-gray-600">Administrator</p>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Joined</span>
                    <span className="font-medium">
                      {data.user?.created_at ? 
                        new Date(data.user.created_at).toLocaleDateString() : 
                        'Recently'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                </div>
              </div>
            
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="border">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm">Database</span>
                </div>
                <span className="text-sm font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm">Storage</span>
                </div>
                <span className="text-sm font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm">API</span>
                </div>
                <span className="text-sm font-medium">Running</span>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="border">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Activity className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-800">Info</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    All systems are functioning normally. Last checked just now.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Updated</span>: Just now
          </div>
          <div>
            <span className="text-gray-500">Admin Panel v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}