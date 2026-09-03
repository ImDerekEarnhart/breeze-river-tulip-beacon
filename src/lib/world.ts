export const WORLD_SCHEMA = "guided-world/1" as const;

export type WorldPlace =
  | "console"
  | "architecture"
  | "tower"
  | "desktop"
  | "orbita"
  | "traces"
  | "memory";

export type WorldPosition = {
  place: WorldPlace;
  x: number;
  y: number;
};

export type WorldBody = {
  deskStatus: "stopped" | "booting" | "running";
  focused: string;
  pointerX: number;
  pointerY: number;
};

export type Possession = {
  id: string;
  kind: "receipt" | "note" | "artifact";
  title: string;
  ref: string;
};

export type WorldMemoryRef = {
  id: string;
  kind: string;
  title: string;
};

export type Relationship = {
  id: string;
  role: "user" | "student" | "teacher" | "core" | "local";
  status: string;
  note: string;
};

export type Goal = {
  id: string;
  title: string;
  status: "open" | "blocked" | "done";
  blockedBy: string;
};

export type MapRoom = {
  id: WorldPlace;
  label: string;
  visited: boolean;
  visits: number;
};

export type WorldEvent = {
  id: string;
  at: number;
  kind: string;
  summary: string;
  parentReceiptId: string;
};

export type WorldTurn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  runId: string;
  at: number;
};

export type WorldConversation = {
  turns: WorldTurn[];
};

export type WorldState = {
  schemaVersion: typeof WORLD_SCHEMA;
  id: string;
  updatedAt: number;
  coreWorld: false;
  position: WorldPosition;
  body: WorldBody;
  possessions: Possession[];
  memories: WorldMemoryRef[];
  relationships: Relationship[];
  goals: Goal[];
  map: MapRoom[];
  events: WorldEvent[];
  conversation: WorldConversation;
};

const PLACES: { id: WorldPlace; label: string }[] = [
  { id: "console", label: "Console" },
  { id: "architecture", label: "Architecture" },
  { id: "tower", label: "Tower" },
  { id: "desktop", label: "Desktop" },
  { id: "orbita", label: "Core" },
  { id: "traces", label: "Traces" },
  { id: "memory", label: "Memory" },
];

export function placeFromPath(pathname: string): WorldPlace {
  if (pathname.startsWith("/architecture")) return "architecture";
  if (pathname.startsWith("/tower")) return "tower";
  if (pathname.startsWith("/desktop")) return "desktop";
  if (pathname.startsWith("/orbita")) return "orbita";
  if (pathname.startsWith("/traces")) return "traces";
  if (pathname.startsWith("/memory")) return "memory";
  return "console";
}

export function seedWorld(now = 0): WorldState {
  return {
    schemaVersion: WORLD_SCHEMA,
    id: "guided-world",
    updatedAt: now,
    coreWorld: false,
    position: { place: "console", x: 0, y: 0 },
    body: {
      deskStatus: "stopped",
      focused: "",
      pointerX: 720,
      pointerY: 450,
    },
    possessions: [
      {
        id: "pos-receipt-schema",
        kind: "artifact",
        title: "guided-receipt/1",
        ref: "schema",
      },
    ],
    memories: [
      { id: "sem-tower", kind: "semantic", title: "Language tower" },
      { id: "proc-tools", kind: "procedural", title: "Allowed tools" },
    ],
    relationships: [
      { id: "rel-user", role: "user", status: "present", note: "Operator of this preview" },
      { id: "rel-student", role: "student", status: "unconfigured", note: "GPU worker missing. Grok is not the student." },
      { id: "rel-teacher", role: "teacher", status: "explicit-only", note: "Escalation with a reason, never a silent fallback" },
      { id: "rel-core", role: "core", status: "fail-closed", note: "Hodgeform Core via MCP. Not this local world." },
    ],
    goals: [
      { id: "goal-gpu", title: "Connect real student GPU", status: "blocked", blockedBy: "host, model id, health URL" },
      { id: "goal-oauth", title: "Tenant-bound Hodgeform OAuth", status: "blocked", blockedBy: "server credential, not a browser token" },
      { id: "goal-proof", title: "Non-prod Core proof", status: "blocked", blockedBy: "student GPU + OAuth" },
      { id: "goal-bench", title: "Equal-budget comparison", status: "blocked", blockedBy: "proof first" },
    ],
    map: PLACES.map((p) => ({
      id: p.id,
      label: p.label,
      visited: p.id === "console",
      visits: p.id === "console" ? 1 : 0,
    })),
    events: [
      {
        id: "evt-init",
        at: now,
        kind: "world_init",
        summary: "World snapshot created. Chat and world persist together.",
        parentReceiptId: "",
      },
    ],
    conversation: { turns: [] },
  };
}

export function migrateWorld(raw: Partial<WorldState> | null | undefined): WorldState {
  const seed = seedWorld(0);
  if (!raw) return seed;
  return {
    ...seed,
    ...raw,
    schemaVersion: WORLD_SCHEMA,
    coreWorld: false,
    conversation: raw.conversation
      ? { turns: raw.conversation.turns ?? [] }
      : { turns: [] },
    map: raw.map?.length ? raw.map : seed.map,
    goals: raw.goals?.length ? raw.goals : seed.goals,
    relationships: raw.relationships?.length ? raw.relationships : seed.relationships,
  };
}

function touch(world: WorldState, at: number): WorldState {
  return { ...world, updatedAt: at };
}

function pushEvent(world: WorldState, event: WorldEvent): WorldState {
  return { ...world, events: [event, ...world.events].slice(0, 80) };
}

export function applyVisit(world: WorldState, place: WorldPlace, at: number): WorldState {
  const map = world.map.map((room) =>
    room.id === place
      ? { ...room, visited: true, visits: room.visits + 1 }
      : room,
  );
  const next = touch(
    {
      ...world,
      position: { ...world.position, place },
      map,
    },
    at,
  );
  const last = world.events[0];
  if (last?.kind === "visit" && world.position.place === place) return next;
  return pushEvent(next, {
    id: `evt-visit-${at.toString(36)}`,
    at,
    kind: "visit",
    summary: `Visited ${place}`,
    parentReceiptId: "",
  });
}

export function applyDeskBody(
  world: WorldState,
  body: Partial<WorldBody>,
  at: number,
): WorldState {
  const nextBody = { ...world.body, ...body };
  const position =
    typeof body.pointerX === "number" || typeof body.pointerY === "number"
      ? {
          ...world.position,
          place: "desktop" as const,
          x: nextBody.pointerX,
          y: nextBody.pointerY,
        }
      : world.position;
  return touch({ ...world, body: nextBody, position }, at);
}

export function applyTurn(world: WorldState, turn: WorldTurn, at: number): WorldState {
  const turns = [...world.conversation.turns.filter((t) => t.id !== turn.id), turn].slice(-200);
  return touch(
    {
      ...world,
      conversation: { ...world.conversation, turns },
    },
    at,
  );
}

export function replaceConversation(world: WorldState, turns: WorldTurn[], at: number): WorldState {
  return touch(
    {
      ...world,
      conversation: { ...world.conversation, turns: turns.slice(-200) },
    },
    at,
  );
}

export type RunWorldPatch = {
  request: string;
  answer: string;
  receiptHash?: string;
  memoryTitle?: string;
  memoryKind?: string;
  memoryId?: string;
};

export function applyRun(world: WorldState, patch: RunWorldPatch, at: number): WorldState {
  const events = pushEvent(world, {
    id: `evt-run-${at.toString(36)}`,
    at,
    kind: "run",
    summary: patch.request.slice(0, 120),
    parentReceiptId: patch.receiptHash ?? "",
  }).events;

  let possessions: Possession[] = world.possessions;
  if (patch.receiptHash && !possessions.some((p) => p.ref === patch.receiptHash)) {
    const item: Possession = {
      id: `pos-${patch.receiptHash.slice(0, 8)}`,
      kind: "receipt",
      title: "Run receipt",
      ref: patch.receiptHash,
    };
    possessions = [item, ...possessions].slice(0, 40);
  }

  let memories = world.memories;
  if (patch.memoryId) {
    memories = [
      {
        id: patch.memoryId,
        kind: patch.memoryKind ?? "episodic",
        title: (patch.memoryTitle ?? patch.request).slice(0, 72),
      },
      ...memories.filter((m) => m.id !== patch.memoryId),
    ].slice(0, 80);
  }

  return touch(
    {
      ...world,
      possessions,
      memories,
      events,
    },
    at,
  );
}
