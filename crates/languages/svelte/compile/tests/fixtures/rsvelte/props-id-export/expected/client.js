import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
export default function Props_id_export($$anchor, $$props) {
	const id = $.props_id();
	$.push($$props, true);
	var $$exports = { id };
	return $.pop($$exports);
}
