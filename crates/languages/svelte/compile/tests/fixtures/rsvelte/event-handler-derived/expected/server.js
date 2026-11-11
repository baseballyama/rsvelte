import * as $ from "svelte/internal/server";
export default function Event_handler_derived($$renderer) {
	let d = 1;
	function make() {
		return () => d++;
	}
	$$renderer.push(`<button>${$.escape(d)}</button> <input${$.attr("value", d)}/>`);
}
