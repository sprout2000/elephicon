import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { MenuNode } from "./api";

type Submenu = Extract<MenuNode, { type: "submenu" }>;

type Props = {
  items: MenuNode[];
  /** Where the right click was, in CSS pixels. */
  x: number;
  y: number;
  onSelect: (id: string) => void;
  onClose: () => void;
};

/** The space kept between the menu and the edges of the window. */
const MARGIN = 4;

const keyOf = (node: MenuNode, index: number) => {
  switch (node.type) {
    case "submenu":
      return `submenu-${node.label}`;
    case "separator":
      return `separator-${index}`;
    default:
      return node.id;
  }
};

/**
 * The context menu drawn in the window on Linux. The window is small, so a
 * submenu replaces the list instead of opening beside it, and "‹" goes back.
 */
export const ContextMenu = ({ items, x, y, onSelect, onClose }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState<Submenu[]>([]);
  const [position, setPosition] = useState({ left: x, top: y });

  const current = path.at(-1);
  const nodes = (current ? current.items : items).map((node, index) => ({
    node,
    key: keyOf(node, index),
  }));

  // Keep the menu inside the window. Its size changes with the shown list,
  // so it is measured after every render.
  useLayoutEffect(() => {
    const menu = ref.current;
    if (!menu) return;

    const { width, height } = menu.getBoundingClientRect();
    const left = Math.max(
      MARGIN,
      Math.min(x, window.innerWidth - width - MARGIN),
    );
    const top = Math.max(
      MARGIN,
      Math.min(y, window.innerHeight - height - MARGIN),
    );

    setPosition((prev) =>
      prev.left === left && prev.top === top ? prev : { left, top },
    );
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handlePointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("blur", onClose);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("blur", onClose);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="menu"
      aria-label={current?.label ?? "Menu"}
      className="context-menu"
      style={position}
    >
      {current && (
        <>
          <button
            type="button"
            role="menuitem"
            className="context-menu-item back"
            onClick={() => setPath(path.slice(0, -1))}
          >
            <span className="mark">‹</span>
            <span className="label">{current.label}</span>
          </button>
          <hr className="context-menu-separator" />
        </>
      )}
      {nodes.map(({ node, key }) => {
        switch (node.type) {
          case "separator":
            return <hr key={key} className="context-menu-separator" />;
          case "submenu":
            return (
              <button
                key={key}
                type="button"
                role="menuitem"
                aria-haspopup="menu"
                className="context-menu-item"
                onClick={() => setPath([...path, node])}
              >
                <span className="mark" />
                <span className="label">{node.label}</span>
                <span className="arrow">›</span>
              </button>
            );
          case "check":
            return (
              <button
                key={key}
                type="button"
                role="menuitemcheckbox"
                aria-checked={node.checked}
                className="context-menu-item"
                onClick={() => onSelect(node.id)}
              >
                <span className="mark">{node.checked ? "✓" : ""}</span>
                <span className="label">{node.label}</span>
              </button>
            );
          default:
            return (
              <button
                key={key}
                type="button"
                role="menuitem"
                className="context-menu-item"
                onClick={() => onSelect(node.id)}
              >
                <span className="mark" />
                <span className="label">{node.label}</span>
              </button>
            );
        }
      })}
    </div>
  );
};
