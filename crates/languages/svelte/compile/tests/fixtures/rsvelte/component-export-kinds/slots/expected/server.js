import * as $ from "svelte/internal/server";
export default function Slots($$renderer, $$props) {
	let x = 1;
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, "a", { v: x }, null);
	$$renderer.push(`<!--]-->`);
}
