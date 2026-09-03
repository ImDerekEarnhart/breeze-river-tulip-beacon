import { createHash } from "node:crypto";
import { canonicalize } from "./canonical.ts";

export function hashArtifact(value: unknown): string {
  return createHash("sha256").update(canonicalize(value)).digest("hex");
}
