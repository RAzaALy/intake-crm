import type { KeyboardCoordinateGetter } from "@dnd-kit/core";
import { describe, expect, it } from "vitest";
import { makeContact } from "@/test/factories";
import { buildAnnouncements, columnKeyboardCoordinates, statusFromDroppable } from "./dnd";

describe("statusFromDroppable", () => {
  it("returns the status for a column id and null for anything else", () => {
    expect(statusFromDroppable("active")).toBe("active");
    expect(statusFromDroppable("c12")).toBeNull();
    expect(statusFromDroppable(undefined)).toBeNull();
  });
});

describe("columnKeyboardCoordinates", () => {
  type Args = Parameters<KeyboardCoordinateGetter>[1];

  // Three columns 300px wide, side by side; the dragged card is 200px wide.
  const rects = new Map([
    ["lead", { left: 0, width: 300 }],
    ["active", { left: 320, width: 300 }],
    ["closed", { left: 640, width: 300 }],
  ]);

  // dnd-kit's context and event types have dozens of fields; the code under test reads only a
  // few, so the tests build just those and cast. Same for the announcement events below.
  function press(code: string, overColumn: string | null) {
    const args = {
      currentCoordinates: { x: 50, y: 120 },
      context: {
        over: overColumn ? { id: overColumn } : null,
        droppableRects: rects,
        collisionRect: { width: 200 },
      },
    } as unknown as Args;
    return columnKeyboardCoordinates(new KeyboardEvent("keydown", { code }), args);
  }

  it("jumps right to the middle of the next column, keeping the height", () => {
    expect(press("ArrowRight", "lead")).toEqual({ x: 370, y: 120 });
  });

  it("jumps left to the middle of the previous column", () => {
    expect(press("ArrowLeft", "closed")).toEqual({ x: 370, y: 120 });
  });

  it("does nothing on Up and Down", () => {
    expect(press("ArrowUp", "active")).toBeUndefined();
    expect(press("ArrowDown", "active")).toBeUndefined();
  });

  it("does nothing past the first or last column", () => {
    expect(press("ArrowLeft", "lead")).toBeUndefined();
    expect(press("ArrowRight", "closed")).toBeUndefined();
  });
});

describe("buildAnnouncements", () => {
  const amna = makeContact({ id: "amna", fullName: "Amna Siddiqui", status: "lead" });
  const announce = buildAnnouncements((id) => (id === amna.id ? amna : undefined));
  const active = { id: "amna" };

  // The handlers only read id from active and over, so the rest of the event is left out.
  const start = () => announce.onDragStart?.({ active } as never);
  const over = (id?: string) => announce.onDragOver?.({ active, over: id ? { id } : null } as never);
  const end = (id?: string) => announce.onDragEnd?.({ active, over: id ? { id } : null } as never);

  it("announces pick up, hovering and dropping in another column", () => {
    expect(start()).toBe("Picked up Amna Siddiqui from Lead.");
    expect(over("active")).toBe("Amna Siddiqui is over Active.");
    expect(over()).toBe("Amna Siddiqui is not over a column.");
    expect(end("closed")).toBe("Amna Siddiqui dropped in Closed.");
  });

  it("announces a drop back in the same column and a cancel", () => {
    expect(end("lead")).toBe("Amna Siddiqui dropped back in Lead. No change.");
    expect(end()).toBe("Move cancelled. Amna Siddiqui stays in Lead.");
    expect(announce.onDragCancel?.({ active } as never)).toBe(
      "Move cancelled. Amna Siddiqui stays in Lead.",
    );
  });
});
