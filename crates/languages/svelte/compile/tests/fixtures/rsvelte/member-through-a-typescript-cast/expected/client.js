import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p></p> <p> </p> <p></p>`, 1);
export default function Member_through_a_typescript_cast($$anchor) {
	let o = { p: 1 };
	var fragment = root();
	var p = $.first_child(fragment);
	p.textContent = globalThis.p;
	var p_1 = $.sibling(p, 2);
	var text = $.only_child(p_1, true);
	var p_2 = $.sibling(p_1, 2);
	p_2.textContent = fn();
	$.template_effect(() => $.set_text(text, o.p));
	$.append($$anchor, fragment);
}
