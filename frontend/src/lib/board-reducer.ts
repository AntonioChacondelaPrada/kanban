import { Board, Column } from "@/lib/types";

export type BoardAction =
  | { type: "renameColumn"; columnId: string; title: string }
  | { type: "addCard"; columnId: string; title: string; details: string }
  | { type: "deleteCard"; cardId: string }
  | {
      type: "moveCard";
      cardId: string;
      sourceColumnId: string;
      targetColumnId: string;
      targetIndex: number;
    };

const createId = () =>
  `card-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const moveCardInColumns = (
  columns: Column[],
  cardId: string,
  sourceColumnId: string,
  targetColumnId: string,
  targetIndex: number,
) => {
  const sourceColumn = columns.find((column) => column.id === sourceColumnId);
  const targetColumn = columns.find((column) => column.id === targetColumnId);

  if (!sourceColumn || !targetColumn) {
    return columns;
  }

  const sourceCardIds = sourceColumn.cardIds.filter((id) => id !== cardId);
  const targetCardIds =
    sourceColumnId === targetColumnId ? sourceCardIds : [...targetColumn.cardIds];
  const insertionIndex = clamp(targetIndex, 0, targetCardIds.length);

  targetCardIds.splice(insertionIndex, 0, cardId);

  return columns.map((column) => {
    if (column.id === sourceColumnId && sourceColumnId !== targetColumnId) {
      return { ...column, cardIds: sourceCardIds };
    }
    if (column.id === targetColumnId) {
      return { ...column, cardIds: targetCardIds };
    }
    return column;
  });
};

export const boardReducer = (board: Board, action: BoardAction): Board => {
  switch (action.type) {
    case "renameColumn": {
      const title = action.title.trim();
      if (!title) {
        return board;
      }

      return {
        ...board,
        columns: board.columns.map((column) =>
          column.id === action.columnId ? { ...column, title } : column,
        ),
      };
    }
    case "addCard": {
      const title = action.title.trim();
      const details = action.details.trim();
      if (!title || !details) {
        return board;
      }

      const cardId = createId();

      return {
        cards: {
          ...board.cards,
          [cardId]: { id: cardId, title, details },
        },
        columns: board.columns.map((column) =>
          column.id === action.columnId
            ? { ...column, cardIds: [...column.cardIds, cardId] }
            : column,
        ),
      };
    }
    case "deleteCard": {
      if (!board.cards[action.cardId]) {
        return board;
      }

      const nextCards = { ...board.cards };
      delete nextCards[action.cardId];

      return {
        cards: nextCards,
        columns: board.columns.map((column) => ({
          ...column,
          cardIds: column.cardIds.filter((cardId) => cardId !== action.cardId),
        })),
      };
    }
    case "moveCard": {
      return {
        ...board,
        columns: moveCardInColumns(
          board.columns,
          action.cardId,
          action.sourceColumnId,
          action.targetColumnId,
          action.targetIndex,
        ),
      };
    }
    default:
      return board;
  }
};
