import { Skeleton } from "@/components/ui/Skeleton";

const panelStyles = "flex flex-col gap-4 rounded-panel border border-line bg-surface p-4 md:p-6";

function NoteSkeleton() {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="w-full" />
      <Skeleton className="w-2/3" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

/** Same header, columns and panels as ContactDetails, so nothing jumps when data arrives. */
export function ContactDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <p role="status" className="sr-only">
        Loading contact…
      </p>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-32" />
        <div className="flex flex-col gap-4 md:flex-row md:justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-56" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="h-6 w-36 rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:flex">
            <Skeleton className="h-11 md:h-9 md:w-16" />
            <Skeleton className="h-11 md:h-9 md:w-36" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <div className={panelStyles}>
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-24" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-11 w-24 md:h-9" />
          </div>
          <NoteSkeleton />
          <NoteSkeleton />
          <NoteSkeleton />
        </div>
        <div className={`${panelStyles} lg:col-start-2 lg:row-span-2 lg:row-start-1`}>
          <Skeleton className="h-6 w-20" />
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex flex-col gap-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="w-40" />
            </div>
          ))}
        </div>
        <div className={panelStyles}>
          <Skeleton className="h-6 w-20" />
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="flex flex-col gap-1.5 border-l-2 border-line pl-4">
              <Skeleton className="w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
