import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
export const answer = 42;
export function double(n) {
	return n * 2;
}
var root = $.from_html(`<p></p>`);
export default function Exports($$anchor) {
	let value = "";
	var p = root();
	$.set_style(p, "", {}, { color: value });
	$.append($$anchor, p);
}
