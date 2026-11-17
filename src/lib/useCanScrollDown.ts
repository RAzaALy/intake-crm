import { useEffect, useState, type RefObject } from "react";

/**
 * True while the element has more content below its visible area. Drives the fade at the bottom
 * of a scrolling box, so the fade shows only when there is something left to scroll to.
 */
export function useCanScrollDown(ref: RefObject<HTMLElement | null>): boolean {
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    function update() {
      if (!element) return; // TS cannot see that the check above still holds inside this function.
      // 1px slack: zoomed pages report fractional scroll positions.
      setCanScrollDown(element.scrollTop + element.clientHeight < element.scrollHeight - 1);
    }

    update();
    element.addEventListener("scroll", update, { passive: true });
    // The box changes size with the window; its content changes size when filters change the rows.
    const observer = new ResizeObserver(update);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);

    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [ref]);

  return canScrollDown;
}
