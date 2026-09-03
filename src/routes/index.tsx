import { createFileRoute } from "@tanstack/react-router";
import { ConsoleView } from "@/components/console-view";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <ConsoleView />;
}
