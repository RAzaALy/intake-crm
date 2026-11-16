/* eslint-disable @next/next/no-html-link-for-pages -- plain anchors: the hook listens to DOM clicks, not Next Link */
import { render, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useUnsavedChangesGuard } from "./useUnsavedChangesGuard";

const onLeaveAttempt = vi.fn();

function Harness({ active }: { active: boolean }) {
  useUnsavedChangesGuard(active, onLeaveAttempt);
  return (
    <div>
      <a href="/contacts">list</a>
      <a href="/contacts/new">same path</a>
      <a href="https://other.example/contacts">other origin</a>
      <a href="/contacts" target="_blank">new tab</a>
      <a>no href</a>
    </div>
  );
}

function link(container: HTMLElement, text: string) {
  const el = Array.from(container.querySelectorAll("a")).find((a) => a.textContent === text);
  if (!el) throw new Error(`no link ${text}`);
  return el;
}

// Whether the hook cancelled the last click, read before the swallow below cancels it anyway.
let preventedByHook = false;

// Bubble phase, so it runs after the hook's capture listener. jsdom cannot navigate,
// so every click is cancelled here to keep the output quiet.
function recordAndSwallow(event: MouseEvent) {
  preventedByHook = event.defaultPrevented;
  event.preventDefault();
}

beforeEach(() => {
  vi.clearAllMocks();
  preventedByHook = false;
  window.history.replaceState(null, "", "/contacts/new");
  document.addEventListener("click", recordAndSwallow);
});

afterEach(() => {
  document.removeEventListener("click", recordAndSwallow);
});

describe("useUnsavedChangesGuard", () => {
  it("stops an in-app link and reports it while active", () => {
    const { container } = render(<Harness active />);
    const anchor = link(container, "list");

    fireEvent.click(anchor);

    expect(preventedByHook).toBe(true);
    expect(onLeaveAttempt).toHaveBeenCalledWith(anchor, "/contacts");
  });

  it("ignores links while not active", () => {
    const { container } = render(<Harness active={false} />);

    fireEvent.click(link(container, "list"));

    expect(onLeaveAttempt).not.toHaveBeenCalled();
  });

  it("ignores modifier clicks", () => {
    const { container } = render(<Harness active />);

    fireEvent.click(link(container, "list"), { ctrlKey: true });
    fireEvent.click(link(container, "list"), { metaKey: true });
    fireEvent.click(link(container, "list"), { shiftKey: true });

    expect(onLeaveAttempt).not.toHaveBeenCalled();
  });

  it("ignores links to another origin", () => {
    const { container } = render(<Harness active />);

    fireEvent.click(link(container, "other origin"));

    expect(onLeaveAttempt).not.toHaveBeenCalled();
  });

  it("ignores links to the current path", () => {
    const { container } = render(<Harness active />);

    fireEvent.click(link(container, "same path"));

    expect(onLeaveAttempt).not.toHaveBeenCalled();
  });

  it("ignores links that open a new tab", () => {
    const { container } = render(<Harness active />);

    fireEvent.click(link(container, "new tab"));

    expect(onLeaveAttempt).not.toHaveBeenCalled();
  });

  it("ignores anchors without an href instead of throwing", () => {
    const { container } = render(<Harness active />);

    expect(() => fireEvent.click(link(container, "no href"))).not.toThrow();
    expect(onLeaveAttempt).not.toHaveBeenCalled();
  });

  it("asks the browser to confirm on beforeunload while active", () => {
    render(<Harness active />);
    const event = new Event("beforeunload", { cancelable: true });

    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });
});
