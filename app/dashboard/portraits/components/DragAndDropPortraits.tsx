// app/dashboard/portraits/components/DragAndDropPortraits.tsx
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
import { SortablePortraitItem } from './SortablePortraitItem';
import { updatePortraitOrder } from '../actions';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Portrait {
  id: string | number;
  image_url: string;
  order: number;
  created_at: string;
}

interface DragAndDropPortraitsProps {
  initialPortraits: Portrait[];
}

export function DragAndDropPortraits({ 
  initialPortraits 
}: DragAndDropPortraitsProps) {
  const [portraits, setPortraits] = useState(initialPortraits);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPortraits(initialPortraits);
    setHasChanges(false);
  }, [initialPortraits]);

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
      const oldIndex = portraits.findIndex((p) => String(p.id) === active.id);
      const newIndex = portraits.findIndex((p) => String(p.id) === over.id);

      const newPortraits = arrayMove(portraits, oldIndex, newIndex);
      
      setPortraits(newPortraits);
      setHasChanges(true);
    }
  };

  const updateOrderInDatabase = async () => {
    if (!hasChanges) return;
    
    try {
      setIsSaving(true);
      const updates = portraits.map((portrait, index) => ({
        id: typeof portrait.id === 'string' ? parseInt(portrait.id, 10) : portrait.id,
        order: index + 1,
      }));

      const result = await updatePortraitOrder(updates);
      
      if (result.success) {
        setHasChanges(false);
      } else {
        console.error('Failed to save portrait order');
      }
    } catch (error) {
      console.error('Error updating portrait order:', error);
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
    setPortraits(initialPortraits);
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
            Reorder Portraits
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
              {isSaving ? 'Saving' : 'Save Order'}
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
                • Changes not saved
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
          items={portraits.map(p => String(p.id))} 
          strategy={rectSortingStrategy}
          disabled={!isReordering}
        >
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {portraits.map((portrait) => (
              <SortablePortraitItem 
                key={portrait.id} 
                portrait={portrait} 
                isReordering={isReordering}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId && isReordering ? (
            <div className="cursor-grabbing">
              <div className="relative rounded-lg border-2 border-blue-400 bg-white shadow-xl overflow-hidden transform scale-110 rotate-3">
                {(() => {
                  const portrait = portraits.find(p => String(p.id) === activeId);
                  if (!portrait) return null;
                  
                  return (
                    <>
                      <div className="relative w-40 h-40 bg-gray-100">
                        <Image
                          src={portrait.image_url}
                          alt={`Portrait ${portrait.id}`}
                          fill
                          className="object-cover"
                          sizes="100vw"
                        />
                      </div>
                      
                      {/* Badge de orden flotante */}
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {portraits.findIndex(p => String(p.id) === activeId) + 1}
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