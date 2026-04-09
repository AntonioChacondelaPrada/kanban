import { Board } from "@/lib/types";

export const initialBoard: Board = {
  columns: [
    { id: "todo", title: "To Do", cardIds: ["card-1", "card-2"] },
    { id: "ready", title: "Ready", cardIds: ["card-3"] },
    { id: "in-progress", title: "In Progress", cardIds: ["card-4"] },
    { id: "review", title: "Review", cardIds: ["card-5"] },
    { id: "done", title: "Done", cardIds: ["card-6"] },
  ],
  cards: {
    "card-1": {
      id: "card-1",
      title: "Draft landing page copy",
      details: "Write headline and supporting text for hero section.",
    },
    "card-2": {
      id: "card-2",
      title: "Create logo variations",
      details: "Prepare light and dark versions for app header.",
    },
    "card-3": {
      id: "card-3",
      title: "Set up analytics",
      details: "Add basic page-view tracking for MVP.",
    },
    "card-4": {
      id: "card-4",
      title: "Build board layout",
      details: "Implement responsive 5-column view for desktop first.",
    },
    "card-5": {
      id: "card-5",
      title: "Review interaction polish",
      details: "Check hover, focus, and drag states for smoothness.",
    },
    "card-6": {
      id: "card-6",
      title: "Publish MVP checklist",
      details: "Share go-live criteria with the team.",
    },
  },
};
