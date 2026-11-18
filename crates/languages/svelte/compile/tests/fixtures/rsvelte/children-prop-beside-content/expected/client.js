import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import A from "./A.svelte";
var root = $.from_html(`<p></p>`);
var root_1 = $.from_html(`<b>hi</b>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
export default function Children_prop_beside_content($$anchor) {
	let x = 1;
	var fragment = root_2();
	var node = $.first_child(fragment);
	A(node, {
		children: "foo",
		$$slots: { default: ($$anchor, $$slotProps) => {
			var p = root();
			p.textContent = "1";
			$.append($$anchor, p);
		} }
	});
	var node_1 = $.sibling(node, 2);
	A(node_1, {
		children: 2,
		position: "apart",
		$$slots: { default: ($$anchor, $$slotProps) => {
			var b = root_1();
			$.append($$anchor, b);
		} }
	});
	var node_2 = $.sibling(node_1, 2);
	A(node_2, {
		children: x,
		$$slots: { default: ($$anchor, $$slotProps) => {
			$.next();
			var text = $.text("t");
			$.append($$anchor, text);
		} }
	});
	$.append($$anchor, fragment);
}
