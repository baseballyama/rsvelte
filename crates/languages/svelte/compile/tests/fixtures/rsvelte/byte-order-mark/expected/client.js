import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p></p>`);
export default function Byte_order_mark($$anchor) {
	let x = "a";
	var p = root();
	p.textContent = "a";
	$.append($$anchor, p);
}
