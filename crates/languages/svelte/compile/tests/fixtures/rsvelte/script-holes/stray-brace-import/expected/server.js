import * as $ from "svelte/internal/server";
import StrayBrace from "./stray-brace.svelte";
import Legacy from "./stray-brace-legacy.svelte";
import JavaScript from "./stray-brace-javascript.svelte";
import Async from "./stray-brace-async.svelte";
import Slot from "./stray-brace-slot.svelte";
export default function Stray_brace_import($$renderer) {
	let legacy;
	StrayBrace($$renderer, { n: "x" });
	$$renderer.push(`<!----> `);
	Legacy($$renderer, { n: "x" });
	$$renderer.push(`<!----> `);
	JavaScript($$renderer, { n: "x" });
	$$renderer.push(`<!----> `);
	Async($$renderer, { n: "x" });
	$$renderer.push(`<!----> `);
	Slot($$renderer, { n: "x" });
	$$renderer.push(`<!----> `);
	Legacy($$renderer, { n: 1 });
	$$renderer.push(`<!---->`);
}
