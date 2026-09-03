import { createHash } from "node:crypto";
import type { OrbitaRecord } from "./types";

export function sha256(text: string) {
  return createHash("sha256").update(text).digest("hex");
}

export function compilePlan(question: string, plan: string): OrbitaRecord {
  const trimmed = plan.trim();
  const planHash = sha256(trimmed);
  return {
    caseId: `case-${planHash.slice(0, 8)}`,
    question,
    plan: trimmed,
    planHash,
    status: "frozen",
    createdAt: Date.now(),
  };
}

export function approvePlan(record: OrbitaRecord): OrbitaRecord {
  return { ...record, status: "approved" };
}

export function attachDiscovery(record: OrbitaRecord, discovery: string): OrbitaRecord {
  return { ...record, status: "discovery", discovery };
}

export function evaluateRecord(
  record: OrbitaRecord,
  evaluation: { pass: boolean; notes: string },
): OrbitaRecord {
  return { ...record, status: "evaluated", evaluation };
}
