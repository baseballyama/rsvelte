import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
export const wrap = (value) => (() => value);
const n = "text";
function f() {
	return n;
}
var root = $.from_html(`<p></p>`);
export default function Module_type_assertion($$anchor) {
	let kept = 1;
	var p = root();
	p.textContent = "1";
	$.append($$anchor, p);
}
