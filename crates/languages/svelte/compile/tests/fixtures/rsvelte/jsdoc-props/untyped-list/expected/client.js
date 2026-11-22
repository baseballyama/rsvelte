import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p>`);
export default function Untyped_list($$anchor, $$props) {
	// @ts-check
	let a = 1;
	var p = root();
	var text = $.only_child(p);
	$.template_effect(() => $.set_text(text, `${$$props.n ?? ""}1`));
	$.append($$anchor, p);
}
