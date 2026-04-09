import { fireEvent, render, screen } from "@testing-library/react";
import { KanbanBoard } from "@/components/kanban-board";

describe("KanbanBoard", () => {
  it("renders with initial data", () => {
    render(<KanbanBoard />);

    expect(screen.getByText("Kanban Project Manager")).toBeInTheDocument();
    expect(screen.getByDisplayValue("To Do")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Done")).toBeInTheDocument();
    expect(screen.getByText("Draft landing page copy")).toBeInTheDocument();
  });

  it("renames a column", () => {
    render(<KanbanBoard />);

    const input = screen.getByLabelText("Rename To Do");
    fireEvent.change(input, { target: { value: "Backlog" } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);

    expect(screen.getByDisplayValue("Backlog")).toBeInTheDocument();
  });

  it("adds and deletes a card", () => {
    render(<KanbanBoard />);

    fireEvent.change(screen.getByLabelText("Card title for To Do"), {
      target: { value: "Add CI badge" },
    });
    fireEvent.change(screen.getByLabelText("Card details for To Do"), {
      target: { value: "Put a passing badge in README." },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "Add Card" })[0]);

    expect(screen.getByText("Add CI badge")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete Add CI badge" }));

    expect(screen.queryByText("Add CI badge")).not.toBeInTheDocument();
  });
});
