import type { MenuNode } from "../web/api";

/** A context menu like the one get_context_menu returns, in English. */
export const menuModel: MenuNode[] = [
  {
    type: "submenu",
    label: "File",
    items: [
      { type: "item", id: "open", label: "Open..." },
      { type: "separator" },
      { type: "item", id: "quit", label: "Quit Elephicon" },
    ],
  },
  {
    type: "submenu",
    label: "Settings",
    items: [
      {
        type: "submenu",
        label: "Quality",
        items: [
          { type: "check", id: "quality-low", label: "Low", checked: false },
          {
            type: "check",
            id: "quality-medium",
            label: "Medium",
            checked: false,
          },
          { type: "check", id: "quality-high", label: "High", checked: true },
        ],
      },
    ],
  },
  {
    type: "submenu",
    label: "Help",
    items: [{ type: "item", id: "about", label: "About Elephicon" }],
  },
];
