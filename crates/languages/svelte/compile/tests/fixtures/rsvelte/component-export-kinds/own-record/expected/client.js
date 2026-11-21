import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p>`);
export default function Own_record($$anchor) {
	let r = $.proxy({ own: true });
	var p = root();
	var text = $.only_child(p, true);
	$.template_effect(() => $.set_text(text, r.own));
	$.append($$anchor, p);
}
