import { Panel } from "@/components/ui/Panel";
import { RelativeTime } from "@/components/ui/RelativeTime";
import type { Activity } from "@/features/contacts/schema";
import { describeActivity } from "../describeActivity";

type TimelineProps = {
  /** Newest first, as the repository returns them. */
  activities: Activity[];
  now: Date;
};

/** What happened to this contact, newest first, one plain sentence per entry. */
export function Timeline({ activities, now }: TimelineProps) {
  return (
    <Panel title="Activity">
      {activities.length === 0 ? (
        <p className="text-body text-ink-muted">No activity yet.</p>
      ) : (
        <ol className="flex flex-col">
          {activities.map((activity) => (
            <li
              key={activity.id}
              // A thin rule on the left reads as a timeline without icons or dots.
              className="flex flex-col gap-0.5 border-l-2 border-line py-2 pl-4 first:pt-0 last:pb-0"
            >
              <p className="text-body text-ink">{describeActivity(activity)}</p>
              <RelativeTime iso={activity.createdAt} now={now} className="text-meta text-ink-faint" />
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
