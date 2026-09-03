import { createFileRoute } from "@tanstack/react-router";
import { TowerView } from "@/components/tower-view";

export const Route = createFileRoute("/tower")({
  component: TowerPage,
});

function TowerPage() {
  return <TowerView />;
}
