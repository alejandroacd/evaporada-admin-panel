"use client";

import { useState, useEffect } from "react";
import { CoverCard } from "./cover-card";
import { Cover } from "../types";
import { getAllCovers } from "../actions";
import { toast } from "sonner";

const SECTION_CONFIG = [
  { id: "publications", label: "Publications", color: "bg-blue-50", borderColor: "border-blue-200" },
  { id: "displays", label: "Displays", color: "bg-green-50", borderColor: "border-green-200" },
  { id: "portraits", label: "Portraits", color: "bg-purple-50", borderColor: "border-purple-200" },
  { id: "about", label: "About", color: "bg-yellow-50", borderColor: "border-yellow-200" },
  { id: "instagram", label: "Instagram", color: "bg-pink-50", borderColor: "border-pink-200" },
  { id: "contact", label: "Contact", color: "bg-gray-50", borderColor: "border-gray-200" },
];

export function CoverGrid() {
  const [covers, setCovers] = useState<Cover[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCovers();
  }, []);

  async function loadCovers() {
    try {
      setLoading(true);
      const data = await getAllCovers();
      setCovers(data);
    } catch (error) {
      toast.error("Failed to load covers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleCoverUpdated = () => {
    loadCovers();
    toast.success("Cover updated successfully");
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SECTION_CONFIG.map((section) => (
          <div key={section.id} className="animate-pulse">
            <div className={`h-64 rounded-lg border-2 ${section.borderColor} ${section.color}`} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {SECTION_CONFIG.map((section) => {
        const cover = covers.find(c => c.section === section.id);
        return (
          <CoverCard
            key={section.id}
            section={section.id}
            label={section.label}
            currentCover={cover}
            onCoverUpdated={handleCoverUpdated}
            color={section.color}
            borderColor={section.borderColor}
          />
        );
      })}
    </div>
  );
}