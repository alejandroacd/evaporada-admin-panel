// app/dashboard/publications/components/DragAndDropPublications.tsx
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
import { Publication } from '@/types/index';
import { updatePublicationOrder } from '../actions';
import { ListOrdered } from 'lucide-react';

interface DragAndDropPublicationsProps {
    initialPublications: Publication[];
}

export function DragAndDropPublications({
    initialPublications
}: DragAndDropPublicationsProps) {
    const [publications, setPublications] = useState(initialPublications);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isReordering, setIsReordering] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Sincronizar con props iniciales
    useEffect(() => {
        setPublications(initialPublications);
        setHasChanges(false); // Resetear cambios cuando cambian las publicaciones iniciales
    }, [initialPublications]);

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
            const oldIndex = publications.findIndex((pub) => pub.id === active.id);
            const newIndex = publications.findIndex((pub) => pub.id === over.id);

            const newPublications = arrayMove(publications, oldIndex, newIndex);

            // Actualizar estado local
            setPublications(newPublications);
            setHasChanges(true); // Marcar que hay cambios pendientes
        }
    };

    const updateOrderInDatabase = async () => {
        if (!hasChanges) return;

        try {
            setIsSaving(true);
            const updates = publications.map((pub, index) => ({
                id: typeof pub.id === 'string' ? parseInt(pub.id, 10) : pub.id,
                sort_order: index + 1,
            }));

            const result = await updatePublicationOrder(updates);

            if (result.success) {
                setHasChanges(false); // Resetear cambios después de guardar exitosamente
                // Opcional: Mostrar toast de éxito
            } else {
                // Opcional: Mostrar toast de error
                console.error('Failed to save order');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            // Opcional: Mostrar toast de error
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleReorder = () => {
        if (isReordering && hasChanges) {
            // Si está en modo reordenar y hay cambios, guardar
            updateOrderInDatabase();
            setIsReordering(false);
        } else if (isReordering && !hasChanges) {
            // Si está en modo reordenar pero no hay cambios, simplemente salir
            setIsReordering(false);
        } else {
            // Entrar en modo reordenar
            setIsReordering(true);
        }
    };

    const handleCancelReorder = () => {
        // Revertir a las publicaciones originales
        setPublications(initialPublications);
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
                        className="px-3 py-2 text-sm bg-green-800 text-white rounded-md  transition"
                    >
                        <ListOrdered className="inline-block mr-2" />
                        Reorder Publications
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleToggleReorder}
                            disabled={isSaving}
                            className={`px-4 py-2 rounded-md ${isSaving
                                    ? 'bg-green-400 text-white cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                } transition`}
                        >
                            {isSaving ? 'Saving...' : 'Save Order'}
                        </button>

                        <button
                            onClick={handleCancelReorder}
                            disabled={isSaving}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        {hasChanges && (
                            <span className="ml-2 text-sm text-orange-600 flex items-center">
                                • Changes unsaved
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
                    items={publications.map(p => String(p.id))}
                    strategy={rectSortingStrategy}
                    disabled={!isReordering}
                >
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {publications.map((pub) => (
                            <SortableItem
                                key={pub.id}
                                publication={pub}
                                isReordering={isReordering}
                            />
                        ))}
                    </div>
                </SortableContext>

                <DragOverlay dropAnimation={null}>
                    {activeId && isReordering ? (
                        <div className="relative">
                            {/* Tarjeta principal con efecto de elevación */}
                            <div className="rounded-lg border border-gray-300 bg-white shadow-xl cursor-grabbing transform rotate-3">
                                <div className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-semibold">
                                                {publications.find(p => String(p.id) === activeId)?.title}
                                            </div>
                                            <div className="text-sm text-gray-500">Moving {publications.find(p => String(p.id) === activeId)?.title}
 </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Efecto de sombra/aura */}
                            <div className="absolute inset-0 bg-blue-100 rounded-lg blur-xl opacity-50 -z-10"></div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </>
    );
}