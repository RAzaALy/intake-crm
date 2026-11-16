import type { ReactNode } from "react";
import { Panel } from "@/components/ui/Panel";
import { RelativeTime } from "@/components/ui/RelativeTime";
import { cn } from "@/lib/cn";
import { formatExactTime, formatShortDate } from "@/lib/format";
import type { Contact } from "../schema";
import { SOURCE_LABELS, UNASSIGNED_LABEL } from "../labels";
import { getStaleDays } from "../stale";

// 44px tap target on phones without pushing the text away from its label: the padding
// grows the hit area and the negative margin gives the space back.
const linkStyles =
  "-my-3 inline-block py-3 break-all text-primary underline-offset-2 hover:underline md:my-0 md:py-0";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-meta text-ink-muted">{label}</dt>
      <dd className="text-body text-ink">{children}</dd>
    </div>
  );
}

/** Reference facts, scanned when needed. Email and phone are links so a phone can call. */
export function DetailsPanel({ contact, now }: { contact: Contact; now: Date }) {
  // Same call-back hint as the list, where the call-back actually happens.
  const staleDays = getStaleDays(contact, now);
  return (
    <Panel title="Details">
      <dl className="flex flex-col gap-3">
        <Row label="Email">
          <a href={`mailto:${contact.email}`} className={linkStyles}>
            {contact.email}
          </a>
        </Row>
        <Row label="Phone">
          <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className={cn(linkStyles, "tabular-nums")}>
            {contact.phone}
          </a>
        </Row>
        <Row label="Source">{SOURCE_LABELS[contact.source]}</Row>
        <Row label="Assigned attorney">{contact.assignedTo ?? UNASSIGNED_LABEL}</Row>
        <Row label="Added">
          <time dateTime={contact.createdAt} title={formatExactTime(contact.createdAt)} className="tabular-nums">
            {formatShortDate(contact.createdAt)}
          </time>
        </Row>
        <Row label="Last activity">
          <RelativeTime iso={contact.lastActivityAt} now={now} />
          {staleDays !== null && (
            <span className="block text-meta text-accent">No contact in {staleDays} days</span>
          )}
        </Row>
      </dl>
    </Panel>
  );
}
