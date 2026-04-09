"use client";

import {
  DndContext,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useReducer, useState } from "react";
import { boardReducer } from "@/lib/board-reducer";
import { initialBoard } from "@/lib/seed-data";

type CardFormState = {
  title: string;
  details: string;
};

const EmptyCardForm: CardFormState = {
  title: "",
  details: "",
};

function SortableCard({
  cardId,
  title,
  details,
  columnId,
  onDelete,
}: {
  cardId: string;
  title: string;
  details: string;
  columnId: string;
  onDelete: (cardId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: cardId,
      data: { type: "card", cardId, columnId },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="kanban-card"
      data-testid={`card-${cardId}`}
      suppressHydrationWarning
      {...attributes}
      {...listeners}
    >
      <h3>{title}</h3>
      <p>{details}</p>
      <button
        className="delete-button"
        type="button"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => onDelete(cardId)}
        aria-label={`Delete ${title}`}
      >
        Delete
      </button>
    </article>
  );
}

function ColumnDropZone({ columnId }: { columnId: string }) {
  const { setNodeRef } = useDroppable({
    id: `column-drop-${columnId}`,
    data: { type: "column", columnId },
  });
  return (
    <div
      ref={setNodeRef}
      className="column-drop-zone"
      data-testid={`drop-${columnId}`}
      aria-hidden="true"
    />
  );
}

export function KanbanBoard() {
  const [board, dispatch] = useReducer(boardReducer, initialBoard);
  const [editingColumns, setEditingColumns] = useState<Record<string, string>>({});
  const [cardForms, setCardForms] = useState<Record<string, CardFormState>>({});
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const cardsByColumn = useMemo(
    () =>
      board.columns.reduce<Record<string, typeof board.cards[string][]>>((acc, column) => {
        acc[column.id] = column.cardIds.map((cardId) => board.cards[cardId]).filter(Boolean);
        return acc;
      }, {}),
    [board],
  );

  const handleDragStart = (event: DragStartEvent) => {
    const activeData = event.active.data.current;
    if (activeData?.type === "card") {
      setActiveCardId(String(activeData.cardId));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeData = event.active.data.current;
    const overData = event.over?.data.current;
    setActiveCardId(null);

    if (!activeData || !overData || activeData.type !== "card") {
      return;
    }

    const sourceColumnId = String(activeData.columnId);
    const cardId = String(activeData.cardId);

    if (overData.type === "card") {
      const targetColumnId = String(overData.columnId);
      const targetColumn = board.columns.find((column) => column.id === targetColumnId);
      if (!targetColumn) {
        return;
      }

      const overCardId = String(overData.cardId);
      const targetIndex = targetColumn.cardIds.indexOf(overCardId);
      if (targetIndex < 0) {
        return;
      }

      dispatch({
        type: "moveCard",
        cardId,
        sourceColumnId,
        targetColumnId,
        targetIndex,
      });
      return;
    }

    if (overData.type === "column") {
      const targetColumnId = String(overData.columnId);
      const targetColumn = board.columns.find((column) => column.id === targetColumnId);
      if (!targetColumn) {
        return;
      }

      dispatch({
        type: "moveCard",
        cardId,
        sourceColumnId,
        targetColumnId,
        targetIndex: targetColumn.cardIds.length,
      });
    }
  };

  const activeCard = activeCardId ? board.cards[activeCardId] : null;

  return (
    <main className="page-shell">
      <header className="topbar">
        <h1>Kanban Project Manager</h1>
        <p>Single-board MVP with focused workflows and polished interaction.</p>
      </header>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveCardId(null)}
      >
        <section className="board-grid" aria-label="Kanban board">
          {board.columns.map((column) => {
            const form = cardForms[column.id] ?? EmptyCardForm;
            const cards = cardsByColumn[column.id] ?? [];
            const editingValue = editingColumns[column.id] ?? column.title;

            return (
              <section
                key={column.id}
                className="column-panel"
                aria-label={column.title}
                data-testid={`column-${column.id}`}
              >
                <form
                  className="column-title-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    dispatch({
                      type: "renameColumn",
                      columnId: column.id,
                      title: editingValue,
                    });
                  }}
                >
                  <input
                    aria-label={`Rename ${column.title}`}
                    data-testid={`rename-${column.id}`}
                    value={editingValue}
                    onChange={(event) =>
                      setEditingColumns((prev) => ({
                        ...prev,
                        [column.id]: event.target.value,
                      }))
                    }
                  />
                </form>

                <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
                  <div className="card-stack">
                    {cards.map((card) => (
                      <SortableCard
                        key={card.id}
                        cardId={card.id}
                        title={card.title}
                        details={card.details}
                        columnId={column.id}
                        onDelete={(cardId) => dispatch({ type: "deleteCard", cardId })}
                      />
                    ))}
                    <ColumnDropZone columnId={column.id} />
                  </div>
                </SortableContext>

                <form
                  className="add-card-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    dispatch({
                      type: "addCard",
                      columnId: column.id,
                      title: form.title,
                      details: form.details,
                    });
                    setCardForms((prev) => ({
                      ...prev,
                      [column.id]: EmptyCardForm,
                    }));
                  }}
                >
                  <input
                    placeholder="Card title"
                    aria-label={`Card title for ${column.title}`}
                    data-testid={`new-title-${column.id}`}
                    value={form.title}
                    onChange={(event) =>
                      setCardForms((prev) => ({
                        ...prev,
                        [column.id]: { ...form, title: event.target.value },
                      }))
                    }
                  />
                  <textarea
                    placeholder="Card details"
                    aria-label={`Card details for ${column.title}`}
                    data-testid={`new-details-${column.id}`}
                    value={form.details}
                    onChange={(event) =>
                      setCardForms((prev) => ({
                        ...prev,
                        [column.id]: { ...form, details: event.target.value },
                      }))
                    }
                  />
                  <button type="submit" data-testid={`add-card-${column.id}`}>
                    Add Card
                  </button>
                </form>
              </section>
            );
          })}
        </section>
        <DragOverlay>
          {activeCard ? (
            <article className="kanban-card drag-overlay-card">
              <h3>{activeCard.title}</h3>
              <p>{activeCard.details}</p>
            </article>
          ) : null}
        </DragOverlay>
      </DndContext>
    </main>
  );
}
