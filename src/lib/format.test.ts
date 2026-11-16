import { describe, expect, it } from "vitest";
import { formatExactTime, formatRelativeTime } from "./format";

const now = new Date(2026, 10, 17, 12, 0, 0);
const before = (ms: number) => new Date(now.getTime() - ms).toISOString();
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

describe("formatRelativeTime", () => {
  it('says "Just now" under a minute', () => {
    expect(formatRelativeTime(before(59 * SECOND), now)).toBe("Just now");
  });

  it("switches to minutes at 60 seconds", () => {
    expect(formatRelativeTime(before(MINUTE), now)).toBe("1 minute ago");
  });

  it("rounds days down", () => {
    expect(formatRelativeTime(before(10 * 24 * HOUR + 23 * HOUR), now)).toBe("10 days ago");
  });
});

describe("formatExactTime", () => {
  it("formats as day, short month, year, 12-hour time", () => {
    expect(formatExactTime(new Date(2026, 10, 12, 14, 5).toISOString())).toBe("12 Nov 2026, 2:05 pm");
  });
});
