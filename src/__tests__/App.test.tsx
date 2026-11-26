import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "../web/App";
import { listeners, mockApi, resetMockApi, unlisten } from "./mockApi";

vi.mock("../web/api", async () => {
  const { mockApi } = await import("./mockApi");
  return { api: mockApi };
});

const openButton = () => screen.getByRole("button", { name: "Open an image" });
const icoButton = () => screen.getByRole("button", { name: /ICO$/ });
const icnsButton = () => screen.getByRole("button", { name: /ICNS$/ });
const dropMessage = "Drop your images here...";

// Tauri のイベントを送り、それで始まった変換が終わるまで act の中で待つ
const dragEnter = () =>
  act(async () => {
    listeners.dragDrop?.onEnter();
  });
const dragLeave = () =>
  act(async () => {
    listeners.dragDrop?.onLeave();
  });
const drop = (path = "/Users/me/icon.png") =>
  act(async () => {
    listeners.dragDrop?.onLeave();
    listeners.dragDrop?.onDrop(path);
  });
const openFromMenu = (path: string) =>
  act(async () => {
    listeners.menuOpen?.(path);
  });

/** Makes makeIco wait until the returned function is called. */
const pendingIco = () => {
  let finish: (result: Result) => void = () => {};
  mockApi.makeIco.mockReturnValueOnce(
    new Promise<Result>((resolve) => {
      finish = resolve;
    }),
  );

  return () =>
    act(async () => {
      finish({ type: "success", log: "icon.ico", desktop: true });
    });
};

beforeEach(() => {
  resetMockApi();
});

describe("App", () => {
  it("shows the drop zone with ICO selected", () => {
    render(<App />);

    expect(screen.getByText(dropMessage)).toBeDefined();
    expect(icoButton().getAttribute("aria-pressed")).toBe("true");
    expect(icnsButton().getAttribute("aria-pressed")).toBe("false");
  });

  it("does not use a drag region outside macOS", () => {
    render(<App />);

    expect(
      screen.getByRole("main").hasAttribute("data-tauri-drag-region"),
    ).toBe(false);
  });

  it("switches between ICO and ICNS", () => {
    render(<App />);

    fireEvent.click(icnsButton());
    expect(icoButton().getAttribute("aria-pressed")).toBe("false");
    expect(icnsButton().getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(icoButton());
    expect(icoButton().getAttribute("aria-pressed")).toBe("true");
  });

  it("creates an ICO file from a dropped PNG", async () => {
    render(<App />);

    await drop();

    expect(await screen.findByText("Successfully Completed!")).toBeDefined();
    expect(mockApi.checkImage).toHaveBeenCalledWith("/Users/me/icon.png");
    expect(mockApi.makeIco).toHaveBeenCalledWith("/Users/me/icon.png");
    expect(mockApi.makeIcns).not.toHaveBeenCalled();
    expect(screen.getByText("icon.ico")).toBeDefined();
    expect(document.body.textContent).toContain("on your desktop");
  });

  it("creates an ICNS file when ICNS is selected", async () => {
    render(<App />);

    fireEvent.click(icnsButton());
    await drop();

    expect(await screen.findByText("icon.icns")).toBeDefined();
    expect(mockApi.makeIcns).toHaveBeenCalledWith("/Users/me/icon.png");
    expect(mockApi.makeIco).not.toHaveBeenCalled();
  });

  it("shows where the file was saved", async () => {
    mockApi.makeIco.mockResolvedValueOnce({
      type: "success",
      log: "icon.ico",
      desktop: false,
    });
    render(<App />);

    await drop();

    await screen.findByText("Successfully Completed!");
    expect(document.body.textContent).toContain("in the current folder");
  });

  it("shows the message from the image check and does not convert", async () => {
    mockApi.checkImage.mockResolvedValueOnce(
      "This file has a .png extension, but it is not a PNG image.",
    );
    render(<App />);

    await drop("/Users/me/fake.png");

    expect(await screen.findByText("Something went wrong...")).toBeDefined();
    expect(
      screen.getByText(
        "This file has a .png extension, but it is not a PNG image.",
      ),
    ).toBeDefined();
    expect(mockApi.makeIco).not.toHaveBeenCalled();
  });

  it("shows the error when the image check itself fails", async () => {
    mockApi.checkImage.mockRejectedValueOnce("command check_image not found");
    render(<App />);

    await drop();

    expect(
      await screen.findByText("command check_image not found"),
    ).toBeDefined();
    expect(mockApi.makeIco).not.toHaveBeenCalled();
  });

  it("shows the error when the conversion fails", async () => {
    mockApi.makeIco.mockRejectedValueOnce("Could not save icon.ico");
    render(<App />);

    await drop();

    expect(await screen.findByText("Could not save icon.ico")).toBeDefined();
  });

  it("shows the error when the ICNS conversion fails", async () => {
    mockApi.makeIcns.mockRejectedValueOnce(new Error("icns failed"));
    render(<App />);

    fireEvent.click(icnsButton());
    await drop();

    expect(await screen.findByText("Error: icns failed")).toBeDefined();
  });

  it("goes back to the drop zone with the Back button", async () => {
    mockApi.checkImage.mockResolvedValueOnce("Could not read the file.");
    render(<App />);

    await drop();
    fireEvent.click(await screen.findByRole("button", { name: /Back/ }));

    expect(screen.getByText(dropMessage)).toBeDefined();
  });

  it("converts the file chosen with the elephant button", async () => {
    mockApi.openDialog.mockResolvedValueOnce("/Users/me/chosen.png");
    render(<App />);

    fireEvent.click(openButton());

    expect(await screen.findByText("Successfully Completed!")).toBeDefined();
    expect(mockApi.makeIco).toHaveBeenCalledWith("/Users/me/chosen.png");
  });

  it("does nothing when the open dialog is canceled", async () => {
    render(<App />);

    fireEvent.click(openButton());

    await vi.waitFor(() => expect(mockApi.openDialog).toHaveBeenCalled());
    expect(mockApi.checkImage).not.toHaveBeenCalled();
    expect(screen.getByText(dropMessage)).toBeDefined();
  });

  it("converts the file opened from the menu", async () => {
    render(<App />);

    await openFromMenu("/Users/me/menu.png");

    expect(await screen.findByText("Successfully Completed!")).toBeDefined();
    expect(mockApi.makeIco).toHaveBeenCalledWith("/Users/me/menu.png");
  });

  it("converts a file opened from the menu on the result screen", async () => {
    render(<App />);

    await drop();
    await screen.findByText("icon.ico");
    mockApi.makeIco.mockResolvedValueOnce({
      type: "success",
      log: "other.ico",
      desktop: true,
    });
    await openFromMenu("/Users/me/other.png");

    expect(await screen.findByText("other.ico")).toBeDefined();
  });

  it("ignores an empty path from the menu", async () => {
    render(<App />);

    await openFromMenu("");

    expect(mockApi.checkImage).not.toHaveBeenCalled();
  });

  it("opens a file with Ctrl+O on Windows and Linux", async () => {
    mockApi.openDialog.mockResolvedValueOnce("/Users/me/shortcut.png");
    render(<App />);

    fireEvent.keyDown(window, { key: "o", ctrlKey: true });

    expect(await screen.findByText("Successfully Completed!")).toBeDefined();
    expect(mockApi.makeIco).toHaveBeenCalledWith("/Users/me/shortcut.png");
  });

  it("ignores other keys and Ctrl+O with other modifiers", () => {
    render(<App />);

    fireEvent.keyDown(window, { key: "o" });
    fireEvent.keyDown(window, { key: "p", ctrlKey: true });
    fireEvent.keyDown(window, { key: "O", ctrlKey: true, shiftKey: true });
    fireEvent.keyDown(window, { key: "o", ctrlKey: true, altKey: true });

    expect(mockApi.openDialog).not.toHaveBeenCalled();
  });

  it("stops handling Ctrl+O on unmount", () => {
    const { unmount } = render(<App />);

    unmount();
    fireEvent.keyDown(window, { key: "o", ctrlKey: true });

    expect(mockApi.openDialog).not.toHaveBeenCalled();
  });

  it("opens the context menu at the clicked position", () => {
    render(<App />);

    fireEvent.contextMenu(screen.getByRole("main"), {
      clientX: 120,
      clientY: 80,
    });

    expect(mockApi.contextMenu).toHaveBeenCalledWith(120, 80);
  });

  it("highlights the drop zone while dragging", async () => {
    render(<App />);

    await dragEnter();
    expect(openButton().className).toBe("elephant ondrag");

    await dragLeave();
    expect(openButton().className).toBe("elephant");
  });

  it("ignores drags and drops on the result screen", async () => {
    render(<App />);

    await drop();
    await screen.findByText("Successfully Completed!");
    await dragEnter();
    await drop("/Users/me/second.png");

    expect(mockApi.checkImage).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: /Back/ }));
    expect(openButton().className).toBe("elephant");
  });

  it("ignores new files and controls while converting", async () => {
    const finish = pendingIco();
    render(<App />);

    await drop();
    await vi.waitFor(() => expect(mockApi.makeIco).toHaveBeenCalled());
    expect(openButton().className).toBe("elephant loading");

    await dragEnter();
    expect(openButton().className).toBe("elephant loading");

    await drop("/Users/me/second.png");
    await openFromMenu("/Users/me/third.png");
    fireEvent.click(openButton());
    fireEvent.click(icnsButton());

    expect(mockApi.checkImage).toHaveBeenCalledTimes(1);
    expect(mockApi.openDialog).not.toHaveBeenCalled();
    expect(icoButton().getAttribute("aria-pressed")).toBe("true");

    await finish();
    expect(screen.getByText("Successfully Completed!")).toBeDefined();
  });

  it("stops listening to the events on unmount", async () => {
    const { unmount } = render(<App />);

    unmount();

    await vi.waitFor(() => {
      expect(unlisten.menuOpen).toHaveBeenCalled();
      expect(unlisten.dragDrop).toHaveBeenCalled();
    });
  });
});
