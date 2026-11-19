import * as $ from "svelte/internal/server";
export default function Component($$renderer, $$props) {
	let { value } = $$props;
	function open(id) {
		return id;
	}
	$$renderer.push(`<p>${$.escape(value)}</p>`);
	$.bind_props($$props, { open });
}
