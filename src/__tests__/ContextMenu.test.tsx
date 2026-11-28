import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContextMenu } from "../web/ContextMenu";
import { menuModel } from "./menuModel";

const renderMenu = (x = 10, y = 20) => {
  const onSelect = vi.fn();
  const onClose = vi.fn();
  const view = render(
    <div>
      <p>outside</p>
      <ContextMenu
        items={menuModel}
        x={x}
        y={y}
        onSelect={onSelect}
        onClose={onClose}
      />
    </div>,
  );

  return { onSelect, onClose, ...view };
};

const item = (name: string | RegExp) => screen.getByRole("menuitem", { name });

/** Makes every element report this size, since jsdom has no layout. */
const mockMenuSize = (width: number, height: number) => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height,
    toJSON: () => ({}),
  });
};

const setWindowSize = (width: number, height: number) => {
  Object.defineProperty(window, "innerWidth", {
    value: width,
    configurable: true,
  });
  Object.defineProperty(window, "innerHeight", {
    value: height,
    configurable: true,
  });
};

afterEach(() => {
  vi.restoreAllMocks();
  // jsdom の既定の大きさに戻す
  setWindowSize(1024, 768);
});

describe("ContextMenu", () => {
  it("shows the top level at the clicked position", () => {
    renderMenu(10, 20);

    const menu = screen.getByRole("menu", { name: "Menu" });
    expect(menu.style.left).toBe("10px");
    expect(menu.style.top).toBe("20px");
    expect(
      screen.getAllByRole("menuitem").map((button) => button.textContent),
    ).toEqual(["File›", "Settings›", "Help›"]);
  });

  it("replaces the list with a submenu and goes back", () => {
    renderMenu();

    fireEvent.click(item(/Settings/));
    expect(screen.getByRole("menu", { name: "Settings" })).toBeDefined();

    fireEvent.click(item(/Quality/));
    expect(screen.getByRole("menu", { name: "Quality" })).toBeDefined();
    expect(screen.queryByRole("menuitem", { name: /File/ })).toBeNull();

    fireEvent.click(item(/‹Quality/));
    expect(screen.getByRole("menu", { name: "Settings" })).toBeDefined();

    fireEvent.click(item(/‹Settings/));
    expect(screen.getByRole("menu", { name: "Menu" })).toBeDefined();
  });

  it("shows separators between items", () => {
    const { container } = renderMenu();

    fireEvent.click(item(/File/));

    // one under the back button and one between Open and Quit
    expect(container.querySelectorAll("hr")).toHaveLength(2);
  });

  it("shows the check marks", () => {
    renderMenu();

    fireEvent.click(item(/Settings/));
    fireEvent.click(item(/Quality/));

    const high = screen.getByRole("menuitemcheckbox", { name: /High/ });
    const low = screen.getByRole("menuitemcheckbox", { name: /Low/ });
    expect(high.getAttribute("aria-checked")).toBe("true");
    expect(high.textContent).toBe("✓High");
    expect(low.getAttribute("aria-checked")).toBe("false");
  });

  it("passes the id of the chosen item", () => {
    const { onSelect } = renderMenu();

    fireEvent.click(item(/File/));
    fireEvent.click(item(/Open/));
    expect(onSelect).toHaveBeenLastCalledWith("open");

    fireEvent.click(item(/‹File/));
    fireEvent.click(item(/Settings/));
    fireEvent.click(item(/Quality/));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: /Medium/ }));
    expect(onSelect).toHaveBeenLastCalledWith("quality-medium");
  });

  it("closes with Escape, a click outside or when the window loses focus", () => {
    const { onClose } = renderMenu();

    fireEvent.keyDown(window, { key: "Enter" });
    fireEvent.pointerDown(item(/File/));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.pointerDown(screen.getByText("outside"));
    fireEvent.blur(window);
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("stops listening when it is closed", () => {
    const { onClose, unmount } = renderMenu();

    unmount();
    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("stays inside the window", () => {
    mockMenuSize(200, 100);
    setWindowSize(400, 300);

    renderMenu(350, 280);

    const menu = screen.getByRole("menu");
    expect(menu.style.left).toBe("196px");
    expect(menu.style.top).toBe("196px");
  });

  it("keeps a margin from the top left corner", () => {
    mockMenuSize(500, 400);
    setWindowSize(400, 300);

    renderMenu(0, 0);

    const menu = screen.getByRole("menu");
    expect(menu.style.left).toBe("4px");
    expect(menu.style.top).toBe("4px");
  });
});
