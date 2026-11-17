import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Board } from "@/features/pipeline/components/Board";

export const metadata: Metadata = {
  title: "Pipeline",
};

export default function PipelinePage() {
  return (
    // data-fill-viewport: from 768px the page is one screen tall and each column scrolls (see AppShell).
    <div data-fill-viewport className="md:flex md:min-h-0 md:flex-1 md:flex-col">
      <PageHeader title="Pipeline" />
      {/* Contacts live in localStorage, so the server renders the skeleton and the browser fills it in. */}
      <Board />
    </div>
  );
}
