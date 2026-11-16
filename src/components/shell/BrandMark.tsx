/** Product name with a small green mark, in the favicon colour. */
export function BrandMark() {
  return (
    <span className="flex items-center gap-2 text-base font-semibold text-ink">
      {/* 3px: the 6px control radius would turn a 12px mark into a circle. */}
      <span aria-hidden="true" className="size-3 rounded-[3px] bg-primary" />
      Intake
    </span>
  );
}
