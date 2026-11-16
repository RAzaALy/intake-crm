import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("defaults to type=button so it never submits a form by accident", () => {
    render(<Button>Clear filters</Button>);
    expect(screen.getByRole("button", { name: "Clear filters" })).toHaveAttribute("type", "button");
  });

  it("is disabled and busy while loading, so it cannot be clicked twice", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Saving…
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Saving…" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
