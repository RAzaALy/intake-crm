import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field } from "./Field";
import { Input } from "./Input";

describe("Field", () => {
  it("labels the control and links the hint", () => {
    render(
      <Field label="Phone" hint="Digits, spaces, +, - and brackets are fine.">
        {(control) => <Input {...control} />}
      </Field>,
    );

    const input = screen.getByLabelText("Phone");
    expect(input).toHaveAccessibleDescription("Digits, spaces, +, - and brackets are fine.");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("marks the control invalid and describes it with the error", () => {
    render(
      <Field label="Email" hint="Work or personal." error="Enter an email like name@firm.com.">
        {(control) => <Input {...control} />}
      </Field>,
    );

    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      "Work or personal. Enter an email like name@firm.com.",
    );
  });

  it("says when a field is optional", () => {
    render(
      <Field label="Assigned attorney" optional>
        {(control) => <Input {...control} />}
      </Field>,
    );

    expect(screen.getByLabelText("Assigned attorney (optional)")).toBeInTheDocument();
  });
});
