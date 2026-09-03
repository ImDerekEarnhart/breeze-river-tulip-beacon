function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

export type LocalLanguageSnapshot = {
  language_id: string;
  version: string;
  parent_language_hash: null;
  machine: {
    kind: string;
    not_the_tower_vm: true;
    word_size: null;
  };
  primitive_registry: {
    symbol: string;
    grounding_status: string;
    origin: "DESIGNER_SUPPLIED";
    admission: "BUILT_IN" | "PROVISIONAL";
    validation: "PARTIAL" | "UNVALIDATED";
  }[];
  grammar: {
    constructors: string[];
    read_ops: string[];
    write_ops: string[];
  };
  known_invariances: string[];
  known_boundaries: string[];
  ignorance_queue: { gap_id: string; kind: string; note: string }[];
  local_fiber_worlds: string[];
  promotion_enabled: false;
};

const LOCAL_WORLD_IDS = ["SUM-GT", "XOR-PAIR", "AB-OK", "LEAK-O", "CLOCK", "NONE"] as const;

export function localLanguageSnapshot(): LocalLanguageSnapshot {
  return {
    language_id: "hodgeform-guided-preview-tower",
    version: "0.1.0-preview",
    parent_language_hash: null,
    machine: {
      kind: "lexical-bm25 + finite-fiber-auditor",
      not_the_tower_vm: true,
      word_size: null,
    },
    primitive_registry: [
      {
        symbol: "retrieve",
        grounding_status: "IDENTITY_ONLY",
        origin: "DESIGNER_SUPPLIED",
        admission: "BUILT_IN",
        validation: "PARTIAL",
      },
      {
        symbol: "fiber_diagnose",
        grounding_status: "STRUCTURALLY_GROUNDED",
        origin: "DESIGNER_SUPPLIED",
        admission: "BUILT_IN",
        validation: "PARTIAL",
      },
      {
        symbol: "orb1_admit",
        grounding_status: "STRUCTURALLY_GROUNDED",
        origin: "DESIGNER_SUPPLIED",
        admission: "BUILT_IN",
        validation: "PARTIAL",
      },
      {
        symbol: "flm_audit",
        grounding_status: "STRUCTURALLY_GROUNDED",
        origin: "DESIGNER_SUPPLIED",
        admission: "BUILT_IN",
        validation: "PARTIAL",
      },
      {
        symbol: "color_order",
        grounding_status: "UNRESOLVED",
        origin: "DESIGNER_SUPPLIED",
        admission: "PROVISIONAL",
        validation: "UNVALIDATED",
      },
    ],
    grammar: {
      constructors: ["finite_table", "pi_keys", "target_key", "candidate_channel"],
      read_ops: ["retrieve", "diagnose", "snapshot", "admit", "flm"],
      write_ops: [],
    },
    known_invariances: [],
    known_boundaries: [
      "BM25 retrieval is not executable meaning.",
      "Retrieval is not the Language Tower.",
      "Fiber HOLE is not LANGUAGE_LIMIT.",
      "Q(i) coefficient-ring quarantine is not Core LANGUAGE_LIMIT.",
      "An unimplemented local operator is MISSING_OPERATOR, not LANGUAGE_LIMIT.",
      "Local education smoke exam is not Core LANGUAGE_LIMIT and not a held-out benchmark.",
      "FLM candidate hashes are not Hodgeform Core admission.",
      "Optional ARC, HA-IR, and spectral plugins are quarantined, not on the fast path.",
      "Local digest is not a Hodgeform Core hash.",
      "No language version can self-promote.",
    ],
    ignorance_queue: [
      {
        gap_id: "gap-tower-vm",
        kind: "MISSING_OPERATOR",
        note: "Executable Language Tower VM is not in this repository.",
      },
      {
        gap_id: "gap-symmetry-hunter",
        kind: "MISSING_OPERATOR",
        note: "Transformation Hunter is specified, not implemented.",
      },
      {
        gap_id: "gap-orbl-earn",
        kind: "MISSING_EXPERIMENT",
        note: "No EARNED primitive has passed prospective selectivity here.",
      },
    ],
    local_fiber_worlds: [...LOCAL_WORLD_IDS],
    promotion_enabled: false,
  };
}

export function snapshotCanonical(): string {
  return stableStringify(localLanguageSnapshot());
}
