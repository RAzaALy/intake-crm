import { describe, expect, it } from "vitest";
import { getInitials, getTintIndex } from "./Avatar";

describe("getInitials", () => {
  it("uses the first and last word", () => {
    expect(getInitials("Amna Siddiqui")).toBe("AS");
    expect(getInitials("Maria de la Cruz")).toBe("MC");
  });

  it("handles one word, extra spaces and empty input", () => {
    expect(getInitials("Cher")).toBe("C");
    expect(getInitials("  amna   siddiqui ")).toBe("AS");
    expect(getInitials("")).toBe("");
  });
});

describe("getTintIndex", () => {
  it("gives the same name the same tint every time", () => {
    expect(getTintIndex("Amna Siddiqui")).toBe(getTintIndex("Amna Siddiqui"));
  });

  it("stays within the five tints", () => {
    for (const name of ["A", "Bilal Khan", "Zoë Müller", "林 美"]) {
      const index = getTintIndex(name);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(5);
    }
  });
});
