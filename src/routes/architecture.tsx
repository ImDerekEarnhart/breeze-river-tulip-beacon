import { createFileRoute } from "@tanstack/react-router";
import { ArchitectureView } from "@/components/architecture-view";

export const Route = createFileRoute("/architecture")({
  component: ArchitecturePage,
});

function ArchitecturePage() {
  return <ArchitectureView />;
}
