// app/dashboard/about/components/about-editor.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Edit2, Eye, EyeOff, Clock } from "lucide-react";
import { toast } from "sonner";
import { updateAbout, createAbout } from "./actions";
import { Loader2 } from "lucide-react";

interface AboutData {
  id: string | null;
  title: string;
  content: string;
  updated_at: string | null;
}

interface AboutEditorProps {
  initialData: Partial<AboutData>;
}

export default function AboutEditor({ initialData }: AboutEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  // Valores por defecto
  const defaultData: AboutData = {
    id: null,
    title: "About Us",
    content: "# Welcome to Our Story\n\nTell your story here...",
    updated_at: null
  };
  
  const [formData, setFormData] = useState<AboutData>({
    ...defaultData,
    ...initialData,
    content: initialData?.content || defaultData.content,
    title: initialData?.title || defaultData.title
  });
  
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        content: initialData.content || prev.content,
        title: initialData.title || prev.title
      }));
      
      if (initialData.updated_at) {
        setLastSaved(new Date(initialData.updated_at).toLocaleString());
      }
    }
  }, [initialData]);

  const handleInputChange = (field: keyof AboutData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    const contentToSave = formData.content || "";
    
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!contentToSave.trim()) {
      toast.error("Content is required");
      return;
    }

    const dataToSave = {
      ...formData,
      content: contentToSave
    };

    startTransition(async () => {
      try {
        let result: any;
        
        if (formData.id) {
          result = await updateAbout(dataToSave);
        } else {
          result = await createAbout(dataToSave);
          if (result.success && result.id) {
            setFormData(prev => ({ ...prev, id: result.id }));
          }
        }

        if (result.success) {
          toast.success("About page saved successfully!");
          setIsEditing(false);
          setLastSaved(new Date().toLocaleString());
        } else {
          toast.error(result.error || "Failed to save");
        }
      } catch (error) {
        console.error("Save error:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  const handleReset = () => {
    setFormData({
      ...defaultData,
      ...initialData,
      content: initialData?.content || defaultData.content,
      title: initialData?.title || defaultData.title
    });
    setIsEditing(false);
    toast.info("Changes reset");
  };

  // Simple renderizado de markdown
  const renderMarkdown = (text: string) => {
    if (!text) return "<p>No content yet...</p>";
    
    return text
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-5 mb-3">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mt-4 mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n\n/g, '</p><p class="my-3">')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">About Page</h1>
      </div>

      {/* Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-lg border mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${formData.id ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm font-medium">
              {formData.id ? "Page exists" : "Not created yet"}
            </span>
          </div>
          
          {lastSaved && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-3 w-3" />
              Last saved: {lastSaved}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={() => setIsEditing(!isEditing)}
            size="sm"
            className="gap-2"
          >
            <Edit2 className="h-3 w-3" />
            {isEditing ? "Editing..." : "Edit"}
          </Button>
          
          <Button
            variant={previewMode ? "default" : "outline"}
            onClick={() => setPreviewMode(!previewMode)}
            size="sm"
            className="gap-2"
          >
            {previewMode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {previewMode ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor/Preview */}
        <div className="lg:col-span-2">
          <Tabs value={previewMode ? "preview" : "edit"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="edit" onClick={() => setPreviewMode(false)}>
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" onClick={() => setPreviewMode(true)}>
                Preview
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Edit About Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Page Title</label>
                    <Input
                      value={formData.title || ""}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="About Us"
                      disabled={!isEditing || isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      value={formData.content || ""}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder="Tell your story here..."
                      disabled={!isEditing || isPending}
                      rows={12}
                      className="resize-none"
                    />
                    <div className="text-xs text-gray-500">
                      Supports Markdown: # Heading, **bold**, *italic*
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h1 className="text-2xl font-bold">{formData.title || "About Us"}</h1>
                    <div 
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(formData.content || "") }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button
                onClick={handleSave}
                disabled={isPending}
                className="gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isPending}
              >
                Reset
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="ml-auto"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar - Simple Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  This page will be displayed at <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">/about</code> on your website.
                </p>
              </div>
              
              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-1">Status</p>
                <div className={`px-2 py-1 rounded text-xs font-medium inline-block ${formData.id ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {formData.id ? 'Published' : 'Draft'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Use headings to organize content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Keep paragraphs short and readable</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}