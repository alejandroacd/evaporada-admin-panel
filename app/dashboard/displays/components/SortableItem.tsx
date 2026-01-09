// app/dashboard/displays/components/SortableItem.tsx
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DisplayCard } from './DisplayCard'; // Extraerás la tarjeta

interface Display {
  id: string | number;
  title: string;
  images: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
  order?: number;
}

interface SortableItemProps {
  display: Display;
  isReordering: boolean;
}

export function SortableItem({ display, isReordering }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: String(display.id)
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isReordering ? 'grab' : 'default',
  };

  if (!isReordering) {
    return <DisplayCard display={display} />;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative ${isDragging ? 'z-10' : ''}`}
    >
      {/* Indicador visual de que se puede arrastrar */}
      <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
        ⋮⋮
      </div>
      <DisplayCard display={display} />
    </div>
  );
}