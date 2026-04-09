import { expect, test } from "@playwright/test";

test("loads initial board", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Kanban Project Manager" })).toBeVisible();
  await expect(page.getByTestId("rename-todo")).toHaveValue("To Do");
  await expect(page.getByTestId("rename-done")).toHaveValue("Done");
});

test("renames a column", async ({ page }) => {
  await page.goto("/");

  const renameInput = page.getByTestId("rename-todo");
  await renameInput.fill("Backlog");
  await renameInput.press("Enter");

  await expect(renameInput).toHaveValue("Backlog");
});

test("adds and deletes a card", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("new-title-todo").fill("Prepare release note");
  await page.getByTestId("new-details-todo").fill("Summarize completed MVP work.");
  await page.getByTestId("add-card-todo").click();

  await expect(page.getByText("Prepare release note")).toBeVisible();

  await page.locator('button[aria-label="Delete Prepare release note"]').click();
  await expect(page.getByText("Prepare release note")).toHaveCount(0);
});

test("moves a card across columns with drag and drop", async ({ page }) => {
  await page.goto("/");

  const sourceCard = page.getByTestId("card-card-1");
  const targetColumn = page.getByTestId("drop-ready");

  const sourceBox = await sourceCard.boundingBox();
  const targetBox = await targetColumn.boundingBox();

  if (!sourceBox || !targetBox) {
    throw new Error("Could not resolve drag-and-drop coordinates");
  }

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, {
    steps: 12,
  });
  await page.mouse.up();

  const readyColumnCard = page.getByTestId("column-ready").getByRole("heading", {
    name: "Draft landing page copy",
  });
  await expect(readyColumnCard).toBeVisible();
});
