import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<div></div> <p></p>`, 1);
export default function Debug_tag_dynamic_by_identifiers($$anchor) {
	let a = 1;
	var fragment = root();
	var p = $.sibling($.first_child(fragment), 2);
	$.template_effect(() => {
		console.log({ a: $.snapshot(a) });
		debugger;
	});
	$.append($$anchor, fragment);
}
