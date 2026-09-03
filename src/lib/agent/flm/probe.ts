import type { ProbeProposal, SurvivorSet, TargetContract } from "./types.ts";

export function proposeDiscriminatingProbe(input: {
  id: string;
  contract: TargetContract;
  survivors: SurvivorSet;
  requestedObservationKeys: readonly string[];
  expectedDiscrimination: string;
}): ProbeProposal {
  if (input.survivors.survivorIds.length < 2) {
    throw new Error("A discriminating probe requires at least two surviving repairs");
  }
  for (const key of input.requestedObservationKeys) {
    if (!input.contract.allowedObservationKeys.includes(key)) {
      throw new Error(`Observation ${key} is not allowed by target contract ${input.contract.id}`);
    }
  }
  return Object.freeze({
    id: input.id,
    targetContractId: input.contract.id,
    survivorIds: Object.freeze([...input.survivors.survivorIds]),
    requestedObservationKeys: Object.freeze([...new Set(input.requestedObservationKeys)].sort()),
    expectedDiscrimination: input.expectedDiscrimination,
    executionRequested: false,
  });
}
