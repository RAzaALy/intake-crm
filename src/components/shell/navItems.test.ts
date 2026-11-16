import { describe, expect, it } from "vitest";
import { isCurrentPath, titleForPath } from "./navItems";

describe("isCurrentPath", () => {
  it("marks a section current on its own path and below it", () => {
    expect(isCurrentPath("/contacts", "/contacts")).toBe(true);
    expect(isCurrentPath("/contacts/abc", "/contacts")).toBe(true);
    expect(isCurrentPath("/contacts-archive", "/contacts")).toBe(false);
    expect(isCurrentPath(null, "/contacts")).toBe(false);
  });
});

describe("titleForPath", () => {
  it("names the top-level pages", () => {
    expect(titleForPath("/contacts")).toBe("Contacts");
    expect(titleForPath("/contacts/new")).toBe("New contact");
    expect(titleForPath("/pipeline")).toBe("Pipeline");
  });

  it("falls back to the product name instead of a parent label", () => {
    expect(titleForPath("/contacts/abc")).toBe("Intake");
    expect(titleForPath("/nope")).toBe("Intake");
    expect(titleForPath(null)).toBe("Intake");
  });
});
