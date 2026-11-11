import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
export const answer = 42;
export function double(n) {
	return n * 2;
}
var rest_excludes = new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
var root = $.from_html(`<p> </p>`);
export default function Exports($$anchor, $$props) {
	$.push($$props, true);
	let value = "";
	const props = $.rest_props($$props, rest_excludes);
	var p = root();
	$.set_attribute(p, "title", value);
	var text = $.only_child(p, true);
	$.template_effect(() => $.set_text(text, $$props.a));
	$.append($$anchor, p);
	$.pop();
}
