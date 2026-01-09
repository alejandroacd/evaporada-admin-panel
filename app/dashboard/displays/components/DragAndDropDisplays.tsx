// app/dashboard/displays/components/DragAndDropDisplays.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { updateDisplayOrder } from '../actions';
import Image from 'next/image';

// Define el tipo Display aquí si no lo tienes en types/index.ts
interface Display {
  id: string | number;
  title: string;
  images: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
  order?: number;
}

interface DragAndDropDisplaysProps {
  initialDisplays: Display[];
}

export function DragAndDropDisplays({ 
  initialDisplays 
}: DragAndDropDisplaysProps) {
  const [displays, setDisplays] = useState(initialDisplays);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar con props iniciales
  useEffect(() => {
    setDisplays(initialDisplays);
    setHasChanges(false);
  }, [initialDisplays]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = displays.findIndex((display) => String(display.id) === active.id);
      const newIndex = displays.findIndex((display) => String(display.id) === over.id);

      const newDisplays = arrayMove(displays, oldIndex, newIndex);
      
      setDisplays(newDisplays);
      setHasChanges(true);
    }
  };

  const updateOrderInDatabase = async () => {
    if (!hasChanges) return;
    
    try {
      setIsSaving(true);
      const updates = displays.map((display, index) => ({
        id: typeof display.id === 'string' ? parseInt(display.id, 10) : display.id,
        order: index + 1,
      }));

      const result = await updateDisplayOrder(updates);
      
      if (result.success) {
        setHasChanges(false);
        // Opcional: mostrar toast de éxito
      } else {
        console.error('Failed to save display order');
      }
    } catch (error) {
      console.error('Error updating display order:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleReorder = () => {
    if (isReordering && hasChanges) {
      updateOrderInDatabase();
      setIsReordering(false);
    } else if (isReordering && !hasChanges) {
      setIsReordering(false);
    } else {
      setIsReordering(true);
    }
  };

  const handleCancelReorder = () => {
    setDisplays(initialDisplays);
    setHasChanges(false);
    setIsReordering(false);
  };

  return (
    <>
      {/* Controles de reordenamiento */}
      <div className="mb-4 flex gap-2 items-center">
        {!isReordering ? (
          <button
            onClick={handleToggleReorder}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Reordenar Displays
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleToggleReorder}
              disabled={isSaving}
              className={`px-4 py-2 rounded-md ${
                isSaving 
                  ? 'bg-green-400 text-white cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              } transition`}
            >
              {isSaving ? 'Guardando...' : 'Guardar Orden'}
            </button>
            
            <button
              onClick={handleCancelReorder}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            
            {hasChanges && (
              <span className="ml-2 text-sm text-orange-600 flex items-center">
                • Hay cambios sin guardar
              </span>
            )}
          </div>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={displays.map(d => String(d.id))} 
          strategy={rectSortingStrategy}
          disabled={!isReordering}
        >
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {displays.map((display) => (
              <SortableItem 
                key={display.id} 
                display={display} 
                isReordering={isReordering}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId && isReordering ? (
            <div className="cursor-grabbing opacity-80">
              <div className="rounded-xl border bg-white shadow-lg overflow-hidden transform rotate-1 scale-105">
                {(() => {
                  const display = displays.find(d => String(d.id) === activeId);
                  if (!display) return null;
                  
                  return (
                    <>
                      {/* IMAGE */}
                      {display.images?.[0] ? (
                        <div className="relative w-full h-48 bg-gray-100">
                          <Image
                            src={display.images[0]}
                            alt={display.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                      
                      {/* Solo el título */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {display.title}
                        </h3>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}