"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Strikethrough,
  Link as LinkIcon,
  List,
  ListOrdered,
} from "lucide-react";
import { useState, useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Separar la configuración del editor
const extensions = [
  StarterKit.configure({
    bold: {
      HTMLAttributes: {
        class: "font-bold",
      },
    },
    italic: {
      HTMLAttributes: {
        class: "italic",
      },
    },
    strike: {
      HTMLAttributes: {
        class: "line-through",
      },
    },
    bulletList: {
      HTMLAttributes: {
        class: "list-disc pl-4",
      },
    },
    orderedList: {
      HTMLAttributes: {
        class: "list-decimal pl-4",
      },
    },
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-blue-600 underline",
    },
  }),
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter description...",
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Usar useEffect para marcar cuando el componente está montado en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions,
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[150px] p-3 focus:outline-none",
      },
    },
    // Esta es la parte importante para SSR
    immediatelyRender: false,
  });

  const addLink = () => {
    if (!editor) return;
    
    if (linkUrl.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setShowLinkInput(false);
      return;
    }

    // Asegurar que la URL tenga protocolo
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
    
    setLinkUrl("");
    setShowLinkInput(false);
  };

  if (!mounted) {
    return (
      <div className="border rounded-md min-h-[200px] p-4 bg-gray-50 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (!editor) {
    return (
      <div className="border rounded-md min-h-[200px] p-4">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-gray-200" : ""}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-gray-200" : ""}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "bg-gray-200" : ""}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-gray-200" : ""}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-gray-200" : ""}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (editor.isActive("link")) {
              editor.chain().focus().unsetLink().run();
              setShowLinkInput(false);
            } else {
              setShowLinkInput(true);
            }
          }}
          className={editor.isActive("link") ? "bg-gray-200" : ""}
          title="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="p-2 border-b bg-gray-50 flex gap-2">
          <input
            type="text"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 px-2 py-1 text-sm border rounded"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addLink();
              }
              if (e.key === "Escape") {
                setShowLinkInput(false);
                setLinkUrl("");
              }
            }}
          />
          <Button type="button" size="sm" onClick={addLink}>
            Apply
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setShowLinkInput(false);
              setLinkUrl("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Editor Content */}
      <div className="min-h-[200px] p-3 prose prose-sm max-w-none">
        <EditorContent editor={editor} />
      </div>
      
      {/* Placeholder */}
      {!value && (
        <div className="absolute top-[100px] left-4 text-gray-400 pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
}