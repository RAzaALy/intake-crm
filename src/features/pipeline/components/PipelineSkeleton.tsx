import { Skeleton } from "@/components/ui/Skeleton";

// 3, 2 and 1 cards: uneven like a real queue, so the board does not look full before it loads.
const CARDS_PER_COLUMN = [3, 2, 1];

/** Same boxes as the board: three sunken columns, a heading, then cards. */
export function PipelineSkeleton() {
  return (
    <div className="-mx-4 flex gap-3 overflow-hidden px-4 md:mx-0 md:grid md:grid-cols-3 md:px-0">
      <p role="status" className="sr-only">
        Loading pipeline…
      </p>
      {CARDS_PER_COLUMN.map((cards, column) => (
        <div
          key={column}
          className="flex w-[85%] shrink-0 flex-col gap-3 rounded-panel bg-sunken p-3 md:w-auto"
        >
          <Skeleton className="mx-1 h-5 w-20 bg-line" />
          {Array.from({ length: cards }, (_, card) => (
            <div key={card} className="flex flex-col gap-2 rounded-panel border border-line bg-surface p-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3.5 w-1/2" />
              <div className="flex items-end justify-between">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-11 w-14 md:h-8" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
