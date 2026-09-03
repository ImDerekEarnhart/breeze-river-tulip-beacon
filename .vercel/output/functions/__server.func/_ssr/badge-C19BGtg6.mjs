import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./router-DYYKjlJ5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-C19BGtg6.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em]", {
	variants: { tone: {
		default: "border border-border text-muted",
		student: "border border-student/40 bg-student/10 text-student",
		teacher: "border border-teacher/40 bg-teacher/10 text-teacher",
		ok: "border border-ok/40 bg-ok/10 text-ok",
		warn: "border border-warn/40 bg-warn/10 text-warn",
		fail: "border border-fail/40 bg-fail/10 text-fail",
		live: "border border-accent/40 bg-accent/10 text-accent"
	} },
	defaultVariants: { tone: "default" }
});
function Badge({ className, tone, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ tone }), className),
		...props
	});
}
//#endregion
export { Badge as t };
