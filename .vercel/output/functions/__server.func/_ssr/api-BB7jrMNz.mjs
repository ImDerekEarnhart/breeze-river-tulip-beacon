import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-BB7jrMNz.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
createServerFn({ method: "GET" }).handler(createSsrRpc("2af88fd0e65b35b615d69e45cc893025902a17f41b2501e583baf1f8b098c0be"));
var getInfrastructure = createServerFn({ method: "GET" }).handler(createSsrRpc("2d3f7c6568954469e325f1cf6d9c045c98a81ff3062f94bf2833fe51f2367a03"));
createServerFn({ method: "GET" }).handler(createSsrRpc("37b423fa6e74782f20668ca07397250cef59463613acc5b049d2d9de9b971643"));
var runSyntheticHodgeformCase = createServerFn({ method: "POST" }).handler(createSsrRpc("be8dba054b3a4e80704a101077f6e9e2427cfcf14b7f13e88991db4d0b785234"));
createServerFn({ method: "GET" }).handler(createSsrRpc("aa9316d55bfd4fd389945356d6ec15f6fd7b416e2ac9017a19f0b016fa64923a"));
var runFlmScenario = createServerFn({ method: "POST" }).validator((input) => ({ id: String(input?.id ?? "refine").slice(0, 32) })).handler(createSsrRpc("0fcb6008b04db3bc22911f2a05c07db6f6562fa3848791047425f8f1ef6db36c"));
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
}).handler(createSsrRpc("5a883aeda48a7c277fc8d161d1c2939700d59765653c6b0c344daba878a2fb56"));
//#endregion
export { runSyntheticHodgeformCase as i, runAgent as n, runFlmScenario as r, getInfrastructure as t };
