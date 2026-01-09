// app/dashboard/publications/components/SortableItem.tsx
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PublicationCard } from './PublicationCard'; // Extraerás la tarjeta
import { Publication } from '@/types';

interface SortableItemProps {
  publication: Publication;
  isReordering: boolean;
}

export function SortableItem({ publication, isReordering }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: publication.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isReordering ? 'grab' : 'default',
  };

  if (!isReordering) {
    return <PublicationCard publication={publication} />;
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
      <PublicationCard publication={publication} />
    </div>
  );
}