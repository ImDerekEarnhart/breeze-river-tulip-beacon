import { createFileRoute } from "@tanstack/react-router";
import { OrbitaView } from "@/components/orbita-view";

export const Route = createFileRoute("/orbita")({ component: OrbitaPage });

function OrbitaPage() {
  return <OrbitaView />;
}
