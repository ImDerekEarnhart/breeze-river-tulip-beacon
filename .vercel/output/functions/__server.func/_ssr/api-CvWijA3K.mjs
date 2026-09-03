import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-CvWijA3K.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getSystemStatus_createServerFn_handler = createServerRpc({
	id: "2af88fd0e65b35b615d69e45cc893025902a17f41b2501e583baf1f8b098c0be",
	name: "getSystemStatus",
	filename: "src/lib/agent/api.ts"
}, (opts) => getSystemStatus.__executeServer(opts));
var getSystemStatus = createServerFn({ method: "GET" }).handler(getSystemStatus_createServerFn_handler, async () => {
	const { getSystemStatusHandler } = await import("./orchestrator.server-CEagMZID.mjs");
	return getSystemStatusHandler();
});
var getInfrastructure_createServerFn_handler = createServerRpc({
	id: "2d3f7c6568954469e325f1cf6d9c045c98a81ff3062f94bf2833fe51f2367a03",
	name: "getInfrastructure",
	filename: "src/lib/agent/api.ts"
}, (opts) => getInfrastructure.__executeServer(opts));
var getInfrastructure = createServerFn({ method: "GET" }).handler(getInfrastructure_createServerFn_handler, async () => {
	const { getInfrastructureHandler } = await import("./orchestrator.server-CEagMZID.mjs");
	return getInfrastructureHandler();
});
var probeHodgeform_createServerFn_handler = createServerRpc({
	id: "37b423fa6e74782f20668ca07397250cef59463613acc5b049d2d9de9b971643",
	name: "probeHodgeform",
	filename: "src/lib/agent/api.ts"
}, (opts) => probeHodgeform.__executeServer(opts));
var probeHodgeform = createServerFn({ method: "GET" }).handler(probeHodgeform_createServerFn_handler, async () => {
	const { probeMcp } = await import("./mcp.server-DDOhHMm3.mjs");
	return probeMcp();
});
var runSyntheticHodgeformCase_createServerFn_handler = createServerRpc({
	id: "be8dba054b3a4e80704a101077f6e9e2427cfcf14b7f13e88991db4d0b785234",
	name: "runSyntheticHodgeformCase",
	filename: "src/lib/agent/api.ts"
}, (opts) => runSyntheticHodgeformCase.__executeServer(opts));
var runSyntheticHodgeformCase = createServerFn({ method: "POST" }).handler(runSyntheticHodgeformCase_createServerFn_handler, async () => {
	const { runSyntheticCase } = await import("./mcp.server-DDOhHMm3.mjs");
	return runSyntheticCase();
});
var listCorpus_createServerFn_handler = createServerRpc({
	id: "aa9316d55bfd4fd389945356d6ec15f6fd7b416e2ac9017a19f0b016fa64923a",
	name: "listCorpus",
	filename: "src/lib/agent/api.ts"
}, (opts) => listCorpus.__executeServer(opts));
var listCorpus = createServerFn({ method: "GET" }).handler(listCorpus_createServerFn_handler, async () => {
	const { listCorpusHandler } = await import("./orchestrator.server-CEagMZID.mjs");
	return listCorpusHandler();
});
var runFlmScenario_createServerFn_handler = createServerRpc({
	id: "0fcb6008b04db3bc22911f2a05c07db6f6562fa3848791047425f8f1ef6db36c",
	name: "runFlmScenario",
	filename: "src/lib/agent/api.ts"
}, (opts) => runFlmScenario.__executeServer(opts));
var runFlmScenario = createServerFn({ method: "POST" }).validator((input) => ({ id: String(input?.id ?? "refine").slice(0, 32) })).handler(runFlmScenario_createServerFn_handler, async ({ data }) => {
	const { runFlmDemo } = await import("./demo.server-DyfdvfEY.mjs").then((n) => n.t);
	return runFlmDemo(data.id);
});
var runAgent_createServerFn_handler = createServerRpc({
	id: "5a883aeda48a7c277fc8d161d1c2939700d59765653c6b0c344daba878a2fb56",
	name: "runAgent",
	filename: "src/lib/agent/api.ts"
}, (opts) => runAgent.__executeServer(opts));
var runAgent = createServerFn({ method: "POST" }).validator((input) => {
	const request = (input?.request ?? "").trim().slice(0, 4e3);
	if (!request) throw new Error("Request required");
	return {
		request,
		mode: input.mode === "governed" ? "governed" : "fast",
		history: (input.history ?? []).slice(-6).map((h) => ({
			role: h.role === "assistant" ? "assistant" : "user",
			content: String(h.content).slice(0, 2e3)
		})),
		desktop: input.desktop
	};
}).handler(runAgent_createServerFn_handler, async ({ data }) => {
	const { executeRun } = await import("./orchestrator.server-CEagMZID.mjs");
	return executeRun(data);
});
//#endregion
export { getInfrastructure_createServerFn_handler, getSystemStatus_createServerFn_handler, listCorpus_createServerFn_handler, probeHodgeform_createServerFn_handler, runAgent_createServerFn_handler, runFlmScenario_createServerFn_handler, runSyntheticHodgeformCase_createServerFn_handler };
