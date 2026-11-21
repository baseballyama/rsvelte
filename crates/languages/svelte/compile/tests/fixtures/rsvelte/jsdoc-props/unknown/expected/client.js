import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p>`);
export default function Unknown($$anchor, $$props) {
	var // @ts-check
	/** @type {Prps} */
	p = root();
	var text = $.only_child(p, true);
	$.template_effect(() => $.set_text(text, $$props.n));
	$.append($$anchor, p);
}
