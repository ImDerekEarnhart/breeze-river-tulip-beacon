import { retrieve } from "./retrieval.ts";
import { runSandbox } from "./sandbox";
import { applyDesk, initialDesktop, type DeskSnapshot } from "../desktop";
import { diagnoseSuite, diagnoseWorld } from "./tower/fibers";
import { LOCAL_FIBER_WORLDS } from "./tower/worlds";
import { CORE_LANGUAGE_ADAPTERS } from "./tower/pipeline";
import { localLanguageSnapshot } from "./tower/snapshot";
import { admitOperator, ORB1_OPERATORS } from "./orb1/admit";
import { runFlmDemo } from "./flm/demo.server.ts";
import type { MemoryItem, ToolCall, ToolResult } from "./types";

export const TOOL_SCHEMAS = [
  {
    name: "sandbox",
    description:
      "Run short Python in an isolated worker. Use for arithmetic, lists, and numeric checks. No files, no network, no OS.",
    arguments: { code: "python source" },
  },
  {
    name: "retrieve",
    description: "Search the retrieval corpus (BM25 + rerank). Not the Language Tower.",
    arguments: { query: "search query" },
  },
  {
    name: "memory_read",
    description: "Read a working or episodic memory item by id or keyword.",
    arguments: { query: "id or keyword" },
  },
  {
    name: "memory_write",
    description: "Write a short note into working memory for this run.",
    arguments: { title: "title", body: "body" },
  },
  {
    name: "orbita_status",
    description:
      "Inspect governed-experiment primitives, ORB-L adapters, and the local language snapshot. Does not freeze or promote.",
    arguments: { topic: "optional focus" },
  },
  {
    name: "fiber_diagnose",
    description:
      "Run the local finite fiber-collision auditor on SUM-GT, XOR-PAIR, AB-OK, LEAK-O, CLOCK, NONE, or suite. Not LANGUAGE_LIMIT. Not Opaque Fiber v1.0.1.",
    arguments: { world: "world id or suite" },
  },
  {
    name: "orb1_admit",
    description:
      "Local Q(i)[Z^d] operator admission. Admit D, exact T_u on the Q(i) unit circle, rational directional D. Quarantine √2 and π/4 as coefficient-ring limits. Not Core LANGUAGE_LIMIT. Never EARNED.",
    arguments: { operator: "coordinate_derivation|exact_translation|physical_derivative_sqrt2|shift_pi_over_4" },
  },
  {
    name: "flm_audit",
    description:
      "Local Fiber Lattice Machine kernel demo: refine, quotient, route, observe, or self_review. Finite worlds only. Candidates are inert until exact-hash external admission. Not Hodgeform Core. Never executes OBSERVE.",
    arguments: { scenario: "refine|quotient|route|observe|self_review" },
  },
  {
    name: "desktop",
    description:
      "SIMULATED PocketDesktop. action=status|start|stop|screenshot|click|type|launch. Not a real VM. Approved apps: chromium, files, terminal, calculator. No root.",
    arguments: {
      action: "status|start|stop|screenshot|click|type|launch",
      x: "px",
      y: "px",
      text: "keys",
      app: "allow-listed app",
    },
  },
] as const;

const ALLOWED = new Set(TOOL_SCHEMAS.map((t) => t.name));

export async function executeTool(
  call: ToolCall,
  memory: MemoryItem[],
  desk: DeskSnapshot = initialDesktop(),
): Promise<{ result: ToolResult; desk: DeskSnapshot }> {
  if (!ALLOWED.has(call.name)) {
    return {
      result: { name: call.name, ok: false, output: "ToolDenied: not in ALLOWED_TOOLS" },
      desk,
    };
  }

  if (call.name === "sandbox") {
    const code = call.arguments.code ?? call.arguments.source ?? "";
    if (!code.trim()) {
      return { result: { name: "sandbox", ok: false, output: "Missing code" }, desk };
    }
    const ran = await runSandbox(code);
    return { result: { name: "sandbox", ok: ran.ok, output: ran.output }, desk };
  }

  if (call.name === "retrieve") {
    const query = call.arguments.query ?? "";
    const docs = retrieve(query, 4);
    return {
      result: {
        name: "retrieve",
        ok: true,
        output: docs
          .map((d) => `[${d.id}] ${d.title}\n${d.text.slice(0, 420)}`)
          .join("\n\n"),
      },
      desk,
    };
  }

  if (call.name === "memory_read") {
    const q = (call.arguments.query ?? "").toLowerCase();
    const hits = memory.filter(
      (m) =>
        m.id.includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.body.toLowerCase().includes(q) ||
        m.kind.includes(q),
    );
    return {
      result: {
        name: "memory_read",
        ok: true,
        output: hits.length
          ? hits
              .slice(0, 6)
              .map((m) => `[${m.kind}/${m.id}] ${m.title}: ${m.body}`)
              .join("\n")
          : "No matching memory.",
      },
      desk,
    };
  }

  if (call.name === "memory_write") {
    return {
      result: {
        name: "memory_write",
        ok: true,
        output: `stored:${call.arguments.title ?? "note"}`,
      },
      desk,
    };
  }

  if (call.name === "orbita_status") {
    const snap = localLanguageSnapshot();
    return {
      result: {
        name: "orbita_status",
        ok: true,
        output: [
          "Core primitives: case_context, compile_plan, submit_plan, get_plan, approve_plan, run_discovery, freeze_external_experiment, record_evaluation.",
          "Frozen plans are SHA-256 hashed and immutable. Ordinary chat should not enter this path.",
          `Language adapters (Core tools, not invented here): ${CORE_LANGUAGE_ADAPTERS.join(", ")}.`,
          `Local snapshot ${snap.language_id} ${snap.version}. machine=${snap.machine.kind}. not_the_tower_vm=${snap.machine.not_the_tower_vm}. promotion_enabled=${snap.promotion_enabled}.`,
          "Local fiber auditor is a finite exact control. It does not issue LANGUAGE_LIMIT or SEARCH_FAILURE. The Tower may not promote itself.",
          "ORB-1 is a local Q(i) coefficient-ring gate. Quarantine of √2 and π/4 is not a Core LANGUAGE_LIMIT and is never EARNED.",
          "FLM is a local finite representation kernel. REFINE/QUOTIENT/OBSERVE/MERGE. Candidates do not self-admit. Not Core.",
        ].join("\n"),
      },
      desk,
    };
  }

  if (call.name === "fiber_diagnose") {
    const id = (call.arguments.world ?? call.arguments.query ?? "suite").trim();
    if (!id || id.toLowerCase() === "suite") {
      const suite = diagnoseSuite(LOCAL_FIBER_WORLDS);
      const rows = suite.audits
        .map(
          (a) =>
            `${a.worldId} ${a.status} expected_ok=${a.matchesExpected} recoveries=${a.admittedRecoverySets.map((s) => s.join("+")).join(";") || "-"} limit=${a.languageLimitIssued}`,
        )
        .join("\n");
      return {
        result: {
          name: "fiber_diagnose",
          ok: true,
          output: `Local suite accuracy ${suite.statusAccuracy} false_holes=${suite.falseHoles} missed=${suite.missedHoles} languageLimitIssued=${suite.languageLimitIssued}\nNot Opaque Fiber v1.0.1.\n${rows}`,
        },
        desk,
      };
    }
    const world = LOCAL_FIBER_WORLDS.find((w) => w.id.toLowerCase() === id.toLowerCase());
    if (!world) {
      return {
        result: {
          name: "fiber_diagnose",
          ok: false,
          output: `Unknown world ${id}. Use SUM-GT, XOR-PAIR, AB-OK, LEAK-O, CLOCK, NONE, or suite.`,
        },
        desk,
      };
    }
    const audit = diagnoseWorld(world);
    return {
      result: {
        name: "fiber_diagnose",
        ok: true,
        output: JSON.stringify({
          worldId: audit.worldId,
          status: audit.status,
          matchesExpected: audit.matchesExpected,
          witnesses: audit.witnesses,
          admittedRecoverySets: audit.admittedRecoverySets,
          provenance: audit.provenance,
          scopeClaim: audit.scopeClaim,
          languageLimitIssued: audit.languageLimitIssued,
          searchFailureIssued: audit.searchFailureIssued,
          notes: audit.notes,
        }),
      },
      desk,
    };
  }

  if (call.name === "orb1_admit") {
    const raw = (call.arguments.operator ?? call.arguments.query ?? call.arguments.world ?? "").trim();
    if (!raw || raw.toLowerCase() === "list") {
      return {
        result: {
          name: "orb1_admit",
          ok: true,
          output: `Local operators: ${ORB1_OPERATORS.join(", ")}. Not Core LANGUAGE_LIMIT. Never EARNED.`,
        },
        desk,
      };
    }
    const decision = admitOperator(raw);
    return {
      result: {
        name: "orb1_admit",
        ok: true,
        output: JSON.stringify(decision),
      },
      desk,
    };
  }

  if (call.name === "flm_audit") {
    const raw = (call.arguments.scenario ?? call.arguments.query ?? call.arguments.world ?? "refine").trim();
    const demo = runFlmDemo(raw);
    return {
      result: {
        name: "flm_audit",
        ok: true,
        output: JSON.stringify(demo),
      },
      desk,
    };
  }

  if (call.name === "desktop") {
    const action = (call.arguments.action ?? "status").toLowerCase();
    let current = desk;
    const notes: string[] = [];
    if (
      current.status !== "running" &&
      (action === "screenshot" || action === "click" || action === "type" || action === "launch")
    ) {
      const booted = applyDesk(current, { action: "start" });
      current = booted.snapshot;
      notes.push(booted.output.split("\n")[0] ?? "started");
    }
    const applied = applyDesk(current, {
      action,
      x: call.arguments.x ? Number(call.arguments.x) : undefined,
      y: call.arguments.y ? Number(call.arguments.y) : undefined,
      text: call.arguments.text,
      app: call.arguments.app,
    });
    const output = notes.length ? `${notes.join("\n")}\n${applied.output}` : applied.output;
    return {
      result: { name: "desktop", ok: applied.ok, output },
      desk: applied.snapshot,
    };
  }

  return {
    result: { name: call.name, ok: false, output: "Unknown tool" },
    desk,
  };
}
