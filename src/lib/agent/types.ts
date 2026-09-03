import type { DeskSnapshot } from "../desktop";
import type { ReceiptEnvelope } from "./receipts";
import type { RouteDecision } from "./roles";

export type { RouteDecision, TeacherRouteReason, FailClosedReason } from "./roles";

export type AgentMode = "fast" | "governed";
export type ModelRole = "student" | "teacher";
export type StepKind =
  | "retrieve"
  | "route"
  | "reason"
  | "tool"
  | "verify"
  | "escalate"
  | "orbita"
  | "answer";

export type RetrievedDoc = {
  id: string;
  title: string;
  text: string;
  score: number;
  tags: string[];
};

export type ToolName =
  | "sandbox"
  | "retrieve"
  | "memory_read"
  | "memory_write"
  | "orbita_status"
  | "fiber_diagnose"
  | "orb1_admit"
  | "flm_audit"
  | "desktop";

export type ToolCall = {
  name: ToolName;
  arguments: Record<string, string>;
};

export type ToolResult = {
  name: ToolName;
  ok: boolean;
  output: string;
};

export type AgentDecision = {
  thought: string;
  confidence: number;
  action: "answer" | "tool" | "escalate";
  tool?: ToolCall;
  answer?: string;
  citations?: string[];
};

export type MemoryKind =
  | "working"
  | "semantic"
  | "episodic"
  | "procedural"
  | "experimental"
  | "training";

export type MemoryItem = {
  id: string;
  kind: MemoryKind;
  title: string;
  body: string;
  createdAt: number;
};

export type RunStep = {
  id: string;
  kind: StepKind;
  title: string;
  detail: string;
  latencyMs: number;
  model?: string;
  data?: {
    name?: string;
    modelId?: string;
    provider?: string;
    ok?: boolean;
    choice?: string;
    planHash?: string;
    ids?: string[];
    titles?: string[];
    action?: string;
    confidence?: number;
    pass?: boolean;
  };
};

export type CorrectionStatus = "quarantined" | "local_pass" | "local_fail";

export type TrainingRecord = {
  id: string;
  prompt: string;
  studentAttempt: string;
  teacherAnswer: string;
  verification: string;
  createdAt: number;
  status?: CorrectionStatus;
  educationPass?: boolean | null;
  educationReason?: string;
  coreApproved?: false;
};

export type OrbitaRecord = {
  caseId: string;
  question: string;
  plan: string;
  planHash: string;
  status: string;
  discovery?: string;
  evaluation?: { pass: boolean; notes: string };
  createdAt: number;
};

export type ProviderCall = {
  role: "student" | "teacher";
  provider: string;
  model: string;
  ok: boolean;
  latencyMs: number;
};

export type HodgeformMeta = {
  connected: boolean;
  status: string;
  host: string;
  tools: string[];
  error?: string;
  authMode?: string;
};

export type RunTrace = {
  id: string;
  createdAt: number;
  request: string;
  mode: AgentMode;
  status: "ok" | "error" | string;
  error?: string;
  escalated: boolean;
  modelPath: string;
  answer: string;
  citations: string[];
  confidence: number;
  steps: RunStep[];
  retrieved: RetrievedDoc[];
  toolTrace: ToolResult[];
  desktop?: DeskSnapshot;
  tokensHint: string;
  totalMs: number;
  providerCalls?: ProviderCall[];
  hodgeform?: HodgeformMeta;
  studentModel?: string;
  teacherModel?: string;
  training?: TrainingRecord;
  orbita?: OrbitaRecord;
  receipts?: ReceiptEnvelope[];
  route?: RouteDecision;
};
