import { createServerFn } from "@tanstack/react-start";
import type { AgentMode, RunTrace } from "./types";
import type { DeskSnapshot } from "../desktop";

export const getSystemStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { getSystemStatusHandler } = await import("./orchestrator.server");
  return getSystemStatusHandler();
});

export const getInfrastructure = createServerFn({ method: "GET" }).handler(async () => {
  const { getInfrastructureHandler } = await import("./orchestrator.server");
  return getInfrastructureHandler();
});

export const probeHodgeform = createServerFn({ method: "GET" }).handler(async () => {
  const { probeMcp } = await import("./hodgeform/mcp.server");
  return probeMcp();
});

export const runSyntheticHodgeformCase = createServerFn({ method: "POST" }).handler(async () => {
  const { runSyntheticCase } = await import("./hodgeform/mcp.server");
  return runSyntheticCase();
});

export const runEducationExam = createServerFn({ method: "POST" }).handler(async () => {
  const { runStudentOnlyExam } = await import("./education/runner.server");
  return runStudentOnlyExam();
});

export const listCorpus = createServerFn({ method: "GET" }).handler(async () => {
  const { listCorpusHandler } = await import("./orchestrator.server");
  return listCorpusHandler();
});

export const runFlmScenario = createServerFn({ method: "POST" })
  .validator((input: { id?: string }) => ({
    id: String(input?.id ?? "refine").slice(0, 32),
  }))
  .handler(async ({ data }) => {
    const { runFlmDemo } = await import("./flm/demo.server");
    return runFlmDemo(data.id);
  });

export const runAgent = createServerFn({ method: "POST" })
  .validator((input: {
    request: string;
    mode: AgentMode;
    history?: { role: string; content: string }[];
    desktop?: DeskSnapshot;
  }) => {
    const request = (input?.request ?? "").trim().slice(0, 4000);
    if (!request) throw new Error("Request required");
    return {
      request,
      mode: input.mode === "governed" ? ("governed" as const) : ("fast" as const),
      history: (input.history ?? []).slice(-6).map((h) => ({
        role: h.role === "assistant" ? "assistant" : "user",
        content: String(h.content).slice(0, 2000),
      })),
      desktop: input.desktop,
    };
  })
  .handler(async ({ data }): Promise<RunTrace> => {
    const { executeRun } = await import("./orchestrator.server");
    return executeRun(data);
  });
