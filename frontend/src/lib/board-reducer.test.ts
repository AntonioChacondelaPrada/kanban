import { boardReducer } from "@/lib/board-reducer";
import { initialBoard } from "@/lib/seed-data";

describe("boardReducer", () => {
  it("renames a column", () => {
    const next = boardReducer(initialBoard, {
      type: "renameColumn",
      columnId: "todo",
      title: "Backlog",
    });

    expect(next.columns.find((column) => column.id === "todo")?.title).toBe("Backlog");
  });

  it("adds and deletes a card", () => {
    const withCard = boardReducer(initialBoard, {
      type: "addCard",
      columnId: "todo",
      title: "New task",
      details: "Important details",
    });

    const todoColumn = withCard.columns.find((column) => column.id === "todo");
    const addedCardId = todoColumn?.cardIds[todoColumn.cardIds.length - 1];
    expect(addedCardId).toBeTruthy();

    const afterDelete = boardReducer(withCard, {
      type: "deleteCard",
      cardId: String(addedCardId),
    });

    expect(afterDelete.cards[String(addedCardId)]).toBeUndefined();
  });

  it("moves card across columns", () => {
    const next = boardReducer(initialBoard, {
      type: "moveCard",
      cardId: "card-1",
      sourceColumnId: "todo",
      targetColumnId: "ready",
      targetIndex: 0,
    });

    expect(next.columns.find((column) => column.id === "todo")?.cardIds).not.toContain("card-1");
    expect(next.columns.find((column) => column.id === "ready")?.cardIds[0]).toBe("card-1");
  });
});
