import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p>`);
export default function Reference($$anchor, $$props) {
	// @ts-check
	/** @typedef {{ n: string }} Props */
	/** @type {Props} */
	let n = $.prop($$props, "n", 3, 1);
	var p = root();
	var text = $.only_child(p, true);
	$.template_effect(() => $.set_text(text, n()));
	$.append($$anchor, p);
}
