import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("keeps a text colour next to a custom text size", () => {
    expect(cn("text-body", "text-on-primary")).toBe("text-body text-on-primary");
  });

  it("lets a later class of the same kind win", () => {
    expect(cn("text-body", "text-meta")).toBe("text-meta");
    expect(cn("rounded-control", "rounded-panel")).toBe("rounded-panel");
  });
});
