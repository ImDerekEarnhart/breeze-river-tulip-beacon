import { createFileRoute } from "@tanstack/react-router";
import { DesktopView } from "@/components/desktop-view";

export const Route = createFileRoute("/desktop")({ component: DesktopPage });

function DesktopPage() {
  return <DesktopView />;
}
