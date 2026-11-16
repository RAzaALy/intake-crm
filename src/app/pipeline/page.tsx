import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Pipeline",
};

export default function PipelinePage() {
  // TODO(phase 7): pipeline board.
  return <PageHeader title="Pipeline" />;
}
