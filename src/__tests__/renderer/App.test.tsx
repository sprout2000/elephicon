import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "../../web/App";
import { installMockApi, ipcEvent } from "./mockApi";

let mock: ReturnType<typeof installMockApi>;

const dropZone = () => screen.getByRole("region", { name: "Drop zone" });
const openButton = () =>
  screen.getByRole("button", { name: "Open a PNG file" });
const icoButton = () => screen.getByRole("button", { name: /ICO$/ });
const icnsButton = () => screen.getByRole("button", { name: /ICNS$/ });

const dropFile = (name = "icon.png") => {
  const file = new File(["data"], name, { type: "image/png" });
  fireEvent.drop(dropZone(), { dataTransfer: { files: [file] } });
};

beforeEach(() => {
  mock = installMockApi();
});

describe("App", () => {
  it("shows the drop zone with ICO selected", () => {
    render(<App />);

    expect(screen.getByText("Drop your PNGs here...")).toBeDefined();
    expect(icoButton().getAttribute("aria-pressed")).toBe("true");
    expect(icnsButton().getAttribute("aria-pressed")).toBe("false");
  });

  it("uses the drag region class on macOS", () => {
    render(<App />);

    expect(screen.getByRole("main").className).toBe("container drag-region");
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

    dropFile();

    expect(await screen.findByText("Successfully Completed!")).toBeDefined();
    expect(mock.api.pngcheck).toHaveBeenCalledWith("/Users/me/icon.png");
    expect(mock.api.mkIco).toHaveBeenCalledWith("/Users/me/icon.png");
    expect(mock.api.mkIcns).not.toHaveBeenCalled();
    expect(screen.getByText("icon.ico")).toBeDefined();
    expect(document.body.textContent).toContain("on your desktop");
  });

  it("creates an ICNS file when ICNS is selected", async () => {
    render(<App />);

    fireEvent.click(icnsButton());
    dropFile();

    expect(await screen.findByText("icon.icns")).toBeDefined();
    expect(mock.api.mkIcns).toHaveBeenCalledWith("/Users/me/icon.png");
    expect(mock.api.mkIco).not.toHaveBeenCalled();
  });

  it("shows where the file was saved", async () => {
    mock.api.mkIco.mockResolvedValueOnce({
      type: "success",
      log: "icon.ico",
      desktop: false,
    });
    render(<App />);

    dropFile();

    await screen.findByText("Successfully Completed!");
    expect(document.body.textContent).toContain("in the current folder");
  });

  it("shows the message from the PNG check and does not convert", async () => {
    mock.api.pngcheck.mockResolvedValueOnce(
      "This file has a .png extension, but it is not a PNG image.",
    );
    render(<App />);

    dropFile("fake.png");

    expect(await screen.findByText("Something went wrong...")).toBeDefined();
    expect(
      screen.getByText(
        "This file has a .png extension, but it is not a PNG image.",
      ),
    ).toBeDefined();
    expect(mock.api.mkIco).not.toHaveBeenCalled();
  });

  it("shows the error when the PNG check itself fails", async () => {
    mock.api.pngcheck.mockRejectedValueOnce(new Error("IPC failed"));
    render(<App />);

    dropFile();

    expect(await screen.findByText("Error: IPC failed")).toBeDefined();
    expect(mock.api.mkIco).not.toHaveBeenCalled();
  });

  it("shows the error when the ICNS conversion fails", async () => {
    mock.api.mkIcns.mockRejectedValueOnce(new Error("icns failed"));
    render(<App />);

    fireEvent.click(icnsButton());
    dropFile();

    expect(await screen.findByText("Error: icns failed")).toBeDefined();
  });

  it("shows the error when the conversion fails", async () => {
    mock.api.mkIco.mockRejectedValueOnce(new Error("boom"));
    render(<App />);

    dropFile();

    expect(await screen.findByText("Error: boom")).toBeDefined();
  });

  it("goes back to the drop zone with the Back button", async () => {
    mock.api.pngcheck.mockResolvedValueOnce("Could not read the file.");
    render(<App />);

    dropFile();
    fireEvent.click(await screen.findByRole("button", { name: /Back/ }));

    expect(screen.getByText("Drop your PNGs here...")).toBeDefined();
  });

  it("converts the file chosen with the elephant button", async () => {
    mock.api.openDialog.mockResolvedValueOnce("/Users/me/chosen.png");
    render(<App />);

    fireEvent.click(openButton());

    expect(await screen.findByText("Successfully Completed!")).toBeDefined();
    expect(mock.api.mkIco).toHaveBeenCalledWith("/Users/me/chosen.png");
  });

  it("does nothing when the open dialog is canceled", async () => {
    render(<App />);

    fireEvent.click(openButton());

    await vi.waitFor(() => expect(mock.api.openDialog).toHaveBeenCalled());
    expect(mock.api.pngcheck).not.toHaveBeenCalled();
    expect(screen.getByText("Drop your PNGs here...")).toBeDefined();
  });

  it("ignores a drop without file data", () => {
    render(<App />);

    fireEvent.drop(dropZone());

    expect(mock.api.getFilePath).not.toHaveBeenCalled();
    expect(mock.api.pngcheck).not.toHaveBeenCalled();
    expect(openButton().className).toBe("elephant");
  });

  it("ignores an empty path from the menu", () => {
    render(<App />);

    act(() => {
      mock.listeners.menuOpen?.(ipcEvent, "");
    });

    expect(mock.api.pngcheck).not.toHaveBeenCalled();
    expect(openButton().className).toBe("elephant");
  });

  it("converts the file opened from the menu", async () => {
    render(<App />);

    act(() => {
      mock.listeners.menuOpen?.(ipcEvent, "/Users/me/menu.png");
    });

    expect(await screen.findByText("Successfully Completed!")).toBeDefined();
    expect(mock.api.mkIco).toHaveBeenCalledWith("/Users/me/menu.png");
  });

  it("accepts destination changes from the menu", () => {
    render(<App />);

    // 出力先は結果画面で mkIco / mkIcns の戻り値から表示されるため、
    // ここでは受け取っても画面が壊れないことだけを確かめる
    act(() => {
      mock.listeners.setDesktop?.(ipcEvent, false);
    });

    expect(mock.api.setDesktop).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Drop your PNGs here...")).toBeDefined();
  });

  it("opens the context menu on right click", () => {
    render(<App />);

    fireEvent.contextMenu(screen.getByRole("main"));

    expect(mock.api.contextMenu).toHaveBeenCalled();
  });

  it("highlights the drop zone while dragging", () => {
    render(<App />);

    fireEvent.dragOver(dropZone());
    expect(openButton().className).toBe("elephant ondrag");

    fireEvent.dragLeave(dropZone());
    expect(openButton().className).toBe("elephant");
  });

  it("ignores the format switch while converting", async () => {
    let finish: (result: Result) => void = () => {};
    mock.api.mkIco.mockReturnValueOnce(
      new Promise<Result>((resolve) => {
        finish = resolve;
      }),
    );
    render(<App />);

    dropFile();
    await vi.waitFor(() => expect(mock.api.mkIco).toHaveBeenCalled());

    expect(openButton().className).toBe("elephant loading");
    fireEvent.click(icnsButton());
    expect(icoButton().getAttribute("aria-pressed")).toBe("true");

    await act(async () => {
      finish({ type: "success", log: "icon.ico", desktop: true });
    });
    expect(screen.getByText("Successfully Completed!")).toBeDefined();
  });

  it("ignores new files and the open button while converting", async () => {
    let finish: (result: Result) => void = () => {};
    mock.api.mkIco.mockReturnValueOnce(
      new Promise<Result>((resolve) => {
        finish = resolve;
      }),
    );
    render(<App />);

    dropFile();
    await vi.waitFor(() => expect(mock.api.mkIco).toHaveBeenCalled());

    fireEvent.dragOver(dropZone());
    expect(openButton().className).toBe("elephant loading");

    dropFile("second.png");
    expect(mock.api.getFilePath).toHaveBeenCalledTimes(1);

    fireEvent.click(openButton());
    expect(mock.api.openDialog).not.toHaveBeenCalled();

    await act(async () => {
      finish({ type: "success", log: "icon.ico", desktop: true });
    });
    expect(mock.api.pngcheck).toHaveBeenCalledTimes(1);
  });

  it("stops listening to the main process on unmount", () => {
    const { unmount } = render(<App />);
    const stopMenuOpen = mock.api.menuOpen.mock.results[0].value;
    const stopSetDesktop = mock.api.setDesktop.mock.results[0].value;

    unmount();

    expect(stopMenuOpen).toHaveBeenCalled();
    expect(stopSetDesktop).toHaveBeenCalled();
  });
});
