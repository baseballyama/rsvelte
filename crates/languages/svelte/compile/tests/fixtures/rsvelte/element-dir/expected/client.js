import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<div dir="auto"></div> <p dir="rtl">static</p>`, 1);
export default function Element_dir($$anchor) {
	let count = 0;
	var fragment = root();
	var div = $.first_child(fragment);
	div.textContent = "0";
	var p = $.sibling(div, 2);
	$.template_effect(() => {
		div.dir = div.dir;
		p.dir = p.dir;
	});
	$.append($$anchor, fragment);
}
