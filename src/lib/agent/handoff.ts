export const HANDOFF_SCHEMA = "guided-executable-systems-handoff/1" as const;

export type HandoffStatus = "live_control" | "live_interchange" | "inspected_not_overwritten" | "quarantined";

export type HandoffItem = {
  id: string;
  title: string;
  status: HandoffStatus;
  path: string;
  wired: boolean;
  note: string;
};

export const HANDOFF_POLICY = {
  schema: HANDOFF_SCHEMA,
  standalone: false,
  containsHodgeformCore: false,
  restoreGuidedFirst: true,
  blindOverwrite: false,
  receiptsAreCoreApproval: false,
  optionalOnFastPath: false,
} as const;

export const HANDOFF_OVERLAY: HandoffItem[] = [
  {
    id: "flm",
    title: "Fiber Lattice Machine",
    status: "live_control",
    path: "src/lib/agent/flm",
    wired: true,
    note: "Finite kernel. Candidates inert until exact-hash admission. Not Core.",
  },
  {
    id: "orb1",
    title: "ORB-1 Q(i) ring",
    status: "live_control",
    path: "src/lib/agent/orb1",
    wired: true,
    note: "Exact coefficient-ring admission. √2 and π/4 stay quarantined. Not LANGUAGE_LIMIT.",
  },
  {
    id: "receipts",
    title: "guided-receipt/1",
    status: "live_interchange",
    path: "src/lib/agent/receipts.ts",
    wired: true,
    note: "Hash-chain interchange. Not Hodgeform Core approval.",
  },
  {
    id: "tower",
    title: "Finite fiber auditor",
    status: "live_control",
    path: "src/lib/agent/tower",
    wired: true,
    note: "Collision / nuisance search on designer worlds. Not Opaque Fiber v1.0.1.",
  },
];

export const HANDOFF_ADAPTERS: HandoffItem[] = [
  {
    id: "hodgeform",
    title: "Hodgeform MCP / OAuth / protocol",
    status: "inspected_not_overwritten",
    path: "src/lib/agent/hodgeform",
    wired: true,
    note: "candidate_adapters hashes matched live files. Newer wiring kept. Blind overwrite forbidden.",
  },
];

export const HANDOFF_OPTIONAL: HandoffItem[] = [
  {
    id: "arc_falsifier",
    title: "ARC representation-repair agent",
    status: "quarantined",
    path: "optional/arc_falsifier",
    wired: false,
    note: "Source and tests only. Not official ARC-AGI-3. Not on the fast path.",
  },
  {
    id: "ha_ir",
    title: "HA-IR v0.2 / v0.3",
    status: "quarantined",
    path: "optional/ha_ir",
    wired: false,
    note: "Executable modules and runners. Unwired. Not Core.",
  },
  {
    id: "orb1_python",
    title: "ORB-1 Python falsifiers",
    status: "quarantined",
    path: "optional/orb1_python",
    wired: false,
    note: "Independent exact arithmetic. Same coefficient ring as the live JS control.",
  },
  {
    id: "spectral_fiber_frozen",
    title: "Frozen spectral fiber runner",
    status: "quarantined",
    path: "optional/spectral_fiber_frozen",
    wired: false,
    note: "Frozen inputs and local approval metadata. Not Opaque Fiber v1.0.1.",
  },
];
