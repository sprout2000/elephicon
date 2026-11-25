import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Message } from "../../web/Message";

describe("Message", () => {
  it("shows the created file name and the desktop as the destination", () => {
    render(
      <Message
        log="icon.ico"
        result="success"
        desktop={true}
        onClickBack={() => {}}
      />,
    );

    expect(screen.getByText("Successfully Completed!")).toBeDefined();
    expect(screen.getByText("icon.ico")).toBeDefined();
    expect(document.body.textContent).toContain("was created on your desktop.");
  });

  it("shows the current folder as the destination", () => {
    render(
      <Message
        log="icon.icns"
        result="success"
        desktop={false}
        onClickBack={() => {}}
      />,
    );

    expect(document.body.textContent).toContain(
      "was created in the current folder.",
    );
  });

  it("shows the error message on failure", () => {
    render(
      <Message
        log="Could not read the file."
        result="failed"
        desktop={true}
        onClickBack={() => {}}
      />,
    );

    expect(screen.getByText("Something went wrong...")).toBeDefined();
    expect(screen.getByText("Could not read the file.")).toBeDefined();
    expect(document.body.textContent).not.toContain("was created");
  });

  it("calls onClickBack when Back is clicked", () => {
    const onClickBack = vi.fn();
    render(
      <Message
        log="icon.ico"
        result="success"
        desktop={true}
        onClickBack={onClickBack}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Back/ }));

    expect(onClickBack).toHaveBeenCalledTimes(1);
  });
});
