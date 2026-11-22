import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p>`);
export default function State_snapshot_ignored($$anchor) {
	let value = $.proxy({ f: () => {} });
	// svelte-ignore state_snapshot_uncloneable
	const copy = $.snapshot(value);
	var p = root();
	var text = $.only_child(p, true);
	$.template_effect(() => $.set_text(text, copy.f));
	$.append($$anchor, p);
}
