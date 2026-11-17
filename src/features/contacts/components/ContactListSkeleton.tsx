import { Skeleton } from "@/components/ui/Skeleton";

const CARDS = Array.from({ length: 8 }, (_, index) => index);
// More rows than fit: the box clips them and reaches the bottom of the screen, like the full list.
const TABLE_ROWS = Array.from({ length: 16 }, (_, index) => index);
// Roughly "All 18", "Lead 8", "Active 6", "Closed 4".
const CHIP_WIDTHS = ["w-16", "w-18", "w-20", "w-20"];

/**
 * Same boxes as the real toolbar, table and cards, so nothing jumps when data arrives.
 * Used as the Suspense fallback and while the query loads.
 */
export function ContactListSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:min-h-0">
      <p role="status" className="sr-only">
        Loading contacts…
      </p>

      {/* Toolbar: label + search, sort, then the chips. */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-11 md:h-9" />
        </div>
        <div className="flex flex-col gap-1.5 md:w-48">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-11 md:h-9" />
        </div>
      </div>
      <div className="flex gap-2">
        {CHIP_WIDTHS.map((width, index) => (
          <Skeleton key={index} className={`h-11 rounded-full md:h-8 ${width}`} />
        ))}
      </div>

      {/* Table, 768px and up. */}
      <div className="hidden min-h-0 overflow-hidden rounded-panel border border-line bg-surface md:block">
        <div className="border-b border-line px-4 py-3">
          <Skeleton className="h-3 w-1/3" />
        </div>
        {TABLE_ROWS.map((row) => (
          <div key={row} className="flex items-center gap-6 border-b border-line px-4 py-2.5 last:border-b-0">
            <div className="flex w-1/4 flex-col gap-1.5">
              <Skeleton className="w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="w-20" />
            <Skeleton className="h-6 w-36 rounded-full" />
            <Skeleton className="w-24" />
            <Skeleton className="w-20" />
          </div>
        ))}
      </div>

      {/* Cards, phones: name + status, email, matter and attorney, conflict + last activity. */}
      <ul className="flex flex-col gap-2 md:hidden">
        {CARDS.map((row) => (
          <li key={row} className="flex flex-col gap-2 rounded-panel border border-line bg-surface p-4">
            <div className="flex justify-between gap-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3.5 w-1/2" />
            <div className="flex justify-between gap-3">
              <Skeleton className="h-6 w-36 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
