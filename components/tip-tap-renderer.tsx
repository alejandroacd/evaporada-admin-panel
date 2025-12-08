// app/components/TipTapRenderer.tsx
"use client";

import { useEffect, useState } from "react";

interface TipTapRendererProps {
  html: string;
  maxLength?: number;
  className?: string;
}

export default function TipTapRenderer({ 
  html, 
  maxLength, 
  className = "" 
}: TipTapRendererProps) {
  const [processedHtml, setProcessedHtml] = useState("");

  useEffect(() => {
    if (!html) {
      setProcessedHtml("");
      return;
    }

    let processed = html;

    // Si hay un maxLength, truncamos el texto (sin cortar etiquetas HTML)
    if (maxLength && html.length > maxLength) {
      // Remover HTML temporalmente para contar caracteres
      const textOnly = html.replace(/<[^>]*>/g, '');
      if (textOnly.length > maxLength) {
        const truncatedText = textOnly.substring(0, maxLength) + "...";
        
        // Mantener la estructura HTML básica si existe
        if (html.includes('<p>')) {
          processed = `<p>${truncatedText}</p>`;
        } else {
          processed = truncatedText;
        }
      }
    }

    setProcessedHtml(processed);
  }, [html, maxLength]);

  if (!html) {
    return <span className="text-gray-500 italic">No description</span>;
  }

  return (
    <div 
      className={`tiptap-renderer ${className}`}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}