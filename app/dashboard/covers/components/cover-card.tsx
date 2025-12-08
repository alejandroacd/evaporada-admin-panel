"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CoverUploadForm } from "./image-upload";
import { Cover } from "../types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Edit, Image as ImageIcon } from "lucide-react";

interface CoverCardProps {
  section: string;
  label: string;
  currentCover: Cover | null | undefined;
  onCoverUpdated: () => void;
  color: string;
  borderColor: string;
}

export function CoverCard({ section, label, currentCover, onCoverUpdated, color, borderColor }: CoverCardProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onCoverUpdated();
  };

  // Convertir null a undefined
  const coverForForm = currentCover === null ? undefined : currentCover;

  return (
    <Card className={`border-2 ${borderColor} overflow-hidden`}>
      <div className={`h-48 ${color} relative overflow-hidden`}>
        {currentCover?.image_url ? (
          <div className="h-full w-full relative">
            <img
              src={currentCover.image_url}
              alt={label}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
      
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{label}</h3>
            {currentCover?.title && currentCover.title !== label && (
              <p className="text-sm text-gray-500">{currentCover.title}</p>
            )}
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                {currentCover?.image_url ? "Replace" : "Upload"}
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Cover for {label}</DialogTitle>
              </DialogHeader>
              
              <CoverUploadForm
                sectionId={section}
                sectionLabel={label}
                currentCover={coverForForm} // <-- Pasar el cover convertido
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="w-full">
          {currentCover?.image_url ? (
            <p className="text-xs text-gray-500 truncate">
              Image URL: {currentCover.image_url.substring(0, 50)}...
            </p>
          ) : (
            <p className="text-xs text-gray-500">No image uploaded</p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}