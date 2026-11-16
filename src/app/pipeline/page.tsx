import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Board } from "@/features/pipeline/components/Board";

export const metadata: Metadata = {
  title: "Pipeline",
};

export default function PipelinePage() {
  return (
    <>
      <PageHeader title="Pipeline" />
      {/* Contacts live in localStorage, so the server renders the skeleton and the browser fills it in. */}
      <Board />
    </>
  );
}
