import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p></p>`);
export default function Events($$anchor) {
	let x = 1;
	var p = root();
	p.textContent = "1";
	$.append($$anchor, p);
}
