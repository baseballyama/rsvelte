import * as $ from "svelte/internal/server";
export default function Props_id_export($$renderer, $$props) {
	const id = $.props_id($$renderer);
	$.bind_props($$props, { id });
}
