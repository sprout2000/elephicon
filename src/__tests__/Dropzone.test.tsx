import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { Dropzone } from "../web/Dropzone";

const renderDropzone = (props: Partial<ComponentProps<typeof Dropzone>>) => {
  const handlers = {
    onClickOS: vi.fn(),
    onClickOpen: vi.fn(async () => {}),
  };

  render(
    <Dropzone
      ico={true}
      drag={false}
      loading={false}
      {...handlers}
      {...props}
    />,
  );

  return handlers;
};

const openButton = () => screen.getByRole("button", { name: "Open an image" });
const icoButton = () => screen.getByRole("button", { name: /ICO$/ });
const icnsButton = () => screen.getByRole("button", { name: /ICNS$/ });
const message = () => screen.getByText("Drop your images here...");

describe("Dropzone", () => {
  it("marks ICO as selected", () => {
    renderDropzone({ ico: true });

    expect(icoButton().getAttribute("aria-pressed")).toBe("true");
    expect(icoButton().className).toBe("icon-container");
    expect(icnsButton().getAttribute("aria-pressed")).toBe("false");
    expect(icnsButton().className).toBe("icon-container unchecked");
  });

  it("marks ICNS as selected", () => {
    renderDropzone({ ico: false });

    expect(icoButton().className).toBe("icon-container unchecked");
    expect(icnsButton().getAttribute("aria-pressed")).toBe("true");
    expect(icnsButton().className).toBe("icon-container");
  });

  it("dims the controls while loading", () => {
    renderDropzone({ loading: true });

    expect(openButton().className).toBe("elephant loading");
    expect(message().className).toBe("text loading");
    expect(icoButton().className).toBe("icon-container loading");
    expect(icnsButton().className).toBe("icon-container loading");
  });

  it("dims the controls while dragging", () => {
    renderDropzone({ drag: true });

    expect(openButton().className).toBe("elephant ondrag");
    expect(message().className).toBe("text loading");
    expect(icoButton().className).toBe("icon-container loading");
  });

  it("forwards clicks to the handlers", () => {
    const handlers = renderDropzone({});

    fireEvent.click(openButton());
    expect(handlers.onClickOpen).toHaveBeenCalledTimes(1);

    fireEvent.click(icoButton());
    fireEvent.click(icnsButton());
    expect(handlers.onClickOS).toHaveBeenCalledTimes(2);
  });
});
