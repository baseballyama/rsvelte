import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p>`);
export default function Statement($$anchor, $$props) {
	// @ts-check
	/** @type {{ n: number }} */
	let a = 1;
	var p = root();
	var text = $.only_child(p);
	$.template_effect(() => $.set_text(text, `${$$props.n ?? ""}1`));
	$.append($$anchor, p);
}
