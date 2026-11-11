import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p>`);
export default function State_snapshot_in_template($$anchor, $$props) {
	$.push($$props, true);
	let items = $.proxy([1, 2]);
	var p = root();
	var text = $.only_child(p, true);
	$.template_effect(($0) => $.set_text(text, $0), [() => $.snapshot(items).length]);
	$.append($$anchor, p);
	$.pop();
}
