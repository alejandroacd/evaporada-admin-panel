// app/dashboard/portraits/components/SortablePortraitItem.tsx
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PortraitCard } from './PortraitCard';

interface Portrait {
  id: string | number;
  image_url: string;
  order: number;
  created_at: string;
}

interface SortablePortraitItemProps {
  portrait: Portrait;
  isReordering: boolean;
}

export function SortablePortraitItem({ portrait, isReordering }: SortablePortraitItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: String(portrait.id)
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isReordering ? 'grab' : 'default',
  };

  if (!isReordering) {
    return <PortraitCard portrait={portrait} />;
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
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs z-20">
        ⋮⋮
      </div>
      <PortraitCard portrait={portrait} />
    </div>
  );
}