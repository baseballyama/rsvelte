import * as $ from "svelte/internal/server";
export default function Legacy_export($$renderer, $$props) {
	function api() {}
	$$renderer.push(`<p>x</p>`);
	$.bind_props($$props, { api });
}
