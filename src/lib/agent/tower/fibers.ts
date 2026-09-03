export type Provenance = "independent" | "pi_derived" | "target_derived";

export type FiniteState = {
  id: string;
  features: Record<string, string | number>;
};

export type Candidate = {
  id: string;
  label: string;
  keys: string[];
  provenance: Provenance;
};

export type FiniteWorld = {
  id: string;
  name: string;
  domain: string;
  adversarialRole: string;
  states: FiniteState[];
  piKeys: string[];
  oKey: string;
  candidates: Candidate[];
  expectedStatus: "HOLE" | "NO_HOLE";
};

export type FiberRow = {
  key: string;
  stateIds: string[];
  oValues: Array<string | number>;
  collision: boolean;
};

export type WorldAudit = {
  worldId: string;
  status: "HOLE" | "NO_HOLE";
  matchesExpected: boolean;
  fibers: FiberRow[];
  witnesses: { x: string; y: string; pi: string }[];
  overseparations: { x: string; y: string }[];
  provenance: Record<string, Provenance>;
  admittedRecoverySets: string[][];
  treatedAsGenuineNew: string[];
  scopeClaim: "finite_factorization_only";
  languageLimitIssued: false;
  searchFailureIssued: false;
  notes: string[];
};

function keyOf(features: Record<string, string | number>, keys: string[]): string {
  return keys.map((k) => `${k}=${String(features[k])}`).join("|");
}

function groupBy(
  states: FiniteState[],
  keys: string[],
): Map<string, FiniteState[]> {
  const g = new Map<string, FiniteState[]>();
  for (const s of states) {
    const k = keyOf(s.features, keys);
    const row = g.get(k);
    if (row) row.push(s);
    else g.set(k, [s]);
  }
  return g;
}

function oValues(states: FiniteState[], oKey: string): Array<string | number> {
  return [...new Set(states.map((s) => s.features[oKey]))];
}

function constantOn(states: FiniteState[], oKey: string): boolean {
  return oValues(states, oKey).length <= 1;
}

function subsets<T>(items: T[]): T[][] {
  const out: T[][] = [[]];
  for (const item of items) {
    const n = out.length;
    for (let i = 0; i < n; i += 1) out.push([...out[i], item]);
  }
  return out;
}

export function diagnoseWorld(world: FiniteWorld): WorldAudit {
  const fibers: FiberRow[] = [];
  const witnesses: WorldAudit["witnesses"] = [];
  const grouped = groupBy(world.states, world.piKeys);
  for (const [key, states] of grouped) {
    const o = oValues(states, world.oKey);
    const collision = o.length > 1;
    fibers.push({
      key,
      stateIds: states.map((s) => s.id),
      oValues: o,
      collision,
    });
    if (collision) {
      for (let i = 0; i < states.length; i += 1) {
        for (let j = i + 1; j < states.length; j += 1) {
          if (states[i].features[world.oKey] !== states[j].features[world.oKey]) {
            witnesses.push({ x: states[i].id, y: states[j].id, pi: key });
          }
        }
      }
    }
  }

  const status: "HOLE" | "NO_HOLE" = witnesses.length > 0 ? "HOLE" : "NO_HOLE";

  const overseparations: WorldAudit["overseparations"] = [];
  for (let i = 0; i < world.states.length; i += 1) {
    for (let j = i + 1; j < world.states.length; j += 1) {
      const a = world.states[i];
      const b = world.states[j];
      const sameO = a.features[world.oKey] === b.features[world.oKey];
      const samePi = keyOf(a.features, world.piKeys) === keyOf(b.features, world.piKeys);
      if (sameO && !samePi) overseparations.push({ x: a.id, y: b.id });
    }
  }

  const provenance: Record<string, Provenance> = {};
  for (const c of world.candidates) provenance[c.id] = c.provenance;

  const independent = world.candidates.filter((c) => c.provenance === "independent");
  const treatedAsGenuineNew = independent.map((c) => c.id);

  const notes: string[] = [
    "Finite exact fiber test only. Not a language-limit theorem.",
    "LANGUAGE_LIMIT is not issued from table search. SEARCH_FAILURE is not issued; the table is exhaustive.",
    "This auditor cannot promote a language version.",
  ];

  let admittedRecoverySets: string[][] = [];
  if (status === "HOLE") {
    const valid: string[][] = [];
    for (const set of subsets(independent)) {
      if (set.length === 0) continue;
      const keys = [...world.piKeys, ...set.flatMap((c) => c.keys)];
      const refined = groupBy(world.states, keys);
      const ok = [...refined.values()].every((row) => constantOn(row, world.oKey));
      if (ok) valid.push(set.map((c) => c.id).sort());
    }
    const uniq = [...new Map(valid.map((ids) => [ids.join("+"), ids])).values()];
    const min = uniq.reduce((m, ids) => Math.min(m, ids.length), Infinity);
    admittedRecoverySets = uniq.filter((ids) => ids.length === min).sort((a, b) => a.join().localeCompare(b.join()));
    if (admittedRecoverySets.length === 0) {
      notes.push("No admissible independent recovery in the supplied menu.");
    }
  } else {
    notes.push("NO_HOLE restraint: no recovery admitted on a sufficient representation.");
  }

  return {
    worldId: world.id,
    status,
    matchesExpected: status === world.expectedStatus,
    fibers,
    witnesses,
    overseparations,
    provenance,
    admittedRecoverySets,
    treatedAsGenuineNew,
    scopeClaim: "finite_factorization_only",
    languageLimitIssued: false,
    searchFailureIssued: false,
    notes,
  };
}

export function diagnoseSuite(worlds: FiniteWorld[]): {
  audits: WorldAudit[];
  statusAccuracy: number;
  falseHoles: number;
  missedHoles: number;
  languageLimitIssued: false;
} {
  const audits = worlds.map(diagnoseWorld);
  const n = audits.length || 1;
  const falseHoles = audits.filter((a) => a.status === "HOLE" && !a.matchesExpected).length;
  const missedHoles = audits.filter((a) => a.status === "NO_HOLE" && !a.matchesExpected).length;
  const correct = audits.filter((a) => a.matchesExpected).length;
  return {
    audits,
    statusAccuracy: correct / n,
    falseHoles,
    missedHoles,
    languageLimitIssued: false,
  };
}
