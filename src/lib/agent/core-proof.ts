/** Receipts from the operator-chat Hodgeform channel. Not produced by this app's MCP client. */
export const CORE_PROOF = {
  channel: "operator_chat_hodgeform_mcp",
  notFromAppMcp: true,
  product: "Orbita Agent Research Server",
  version: "0.10.0",
  coreCommit: "d1e663ebfdbd5f8e70475fc888dc8df2c0107c41",
  tenantWorkspace:
    "/data/tenants/g-38f16d6aaaee81190b84d09f60a1ddf4-7286b3981d4f/external_executions",
  uiHealth: {
    service: "orbita-guided-ui",
    version: "2.0.0",
    gitCommit: "86ca2c818ba77d27f9b7ed99e4627d09395d7e09",
  },
  syntheticCase: {
    id: "case_aab638ac2de548f1",
    createdAt: "2026-08-20T22:31:56.135875+00:00",
  },
  syntheticLoop: {
    id: "problem_loop_d7ec0590d4c14576",
    valid: true,
    eventCount: 1,
    eventHash: "78f030fe6eee95d7b7ca8e4fd75510f62d602dd43c4c79ce9a4e40838aa6f1a1",
    artifactHash: "d52bc65497c851aebaa080d5dbe048cdfdcc3100d9883cb53e0792f1e258dd15",
  },
  protocolLoop: {
    id: "problem_loop_3579c46c99934e74",
    valid: true,
    eventCount: 1,
    eventHash: "e5c01d5fdfff6df26f21249aabc49bca62939d32b3fb2158c0c0905a90ce0c08",
    artifactHash: "57b4646020809a738fd9b1363c6075ec0ea914dc64d916871d3038195d787b04",
  },
} as const;
