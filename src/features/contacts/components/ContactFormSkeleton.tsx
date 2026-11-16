import { Skeleton } from "@/components/ui/Skeleton";

type FieldShape = { wide?: boolean; hint?: boolean };

// Mirrors ContactFormFields: which fields span both columns and which have a hint line.
const PERSON_FIELDS: FieldShape[] = [{ wide: true, hint: true }, {}, { hint: true }];
const MATTER_FIELDS: FieldShape[] = [{}, { hint: true }, { hint: true }, { hint: true }, { hint: true }];

function FieldSkeleton({ wide = false, hint = false }: FieldShape) {
  return (
    <div className={wide ? "flex flex-col gap-1.5 md:col-span-2" : "flex flex-col gap-1.5"}>
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-11 md:h-9" />
      {hint && <Skeleton className="h-4 w-48" />}
    </div>
  );
}

function SectionSkeleton({ fields }: { fields: FieldShape[] }) {
  return (
    <div className="flex flex-col gap-4 rounded-panel border border-line bg-surface p-4 md:p-6">
      <Skeleton className="h-6 w-40" />
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field, index) => (
          <FieldSkeleton key={index} {...field} />
        ))}
      </div>
    </div>
  );
}

/** Same panels and grid as ContactForm, shown while a contact loads for editing. */
export function ContactFormSkeleton() {
  return (
    <div className="flex max-w-160 flex-col gap-6">
      <p role="status" className="sr-only">
        Loading contact…
      </p>
      {/* Stands in for the "Edit {name}" h1, which is hidden on phones. */}
      <Skeleton className="h-8 w-56 max-md:hidden" />
      <SectionSkeleton fields={PERSON_FIELDS} />
      <SectionSkeleton fields={MATTER_FIELDS} />
      <div className="flex flex-col gap-2 md:flex-row">
        <Skeleton className="h-11 md:h-9 md:w-32" />
        <Skeleton className="h-11 md:h-9 md:w-20" />
      </div>
    </div>
  );
}
