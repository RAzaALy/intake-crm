/**
 * A link whose ::after covers its nearest `relative` parent (a table row or a card), so the
 * whole row is clickable but stays one tab stop. The focus ring moves to the ::after,
 * so keyboard users see the whole row outlined, not just the name.
 */
export const stretchedLinkStyles =
  "font-medium text-ink outline-none after:absolute after:inset-0 after:content-[''] " +
  "focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-primary";
