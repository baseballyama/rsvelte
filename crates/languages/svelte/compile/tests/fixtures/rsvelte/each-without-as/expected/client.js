import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p></p>`);
var root_1 = $.from_html(`<span></span>`);
var root_2 = $.from_html(`<b>y</b>`);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
export default function Each_without_as($$anchor, $$props) {
	let items = $.prop($$props, "items", 19, () => []), count = $.prop($$props, "count", 3, 2);
	let item = "outer";
	var fragment = root_3();
	var node = $.first_child(fragment);
	$.each(node, 17, items, $.index, ($$anchor, $$item) => {
		var p = root();
		p.textContent = "outer";
		$.append($$anchor, p);
	});
	var node_1 = $.sibling(node, 2);
	$.each(node_1, 17, items, $.index, ($$anchor, $$item, i) => {
		var p_1 = root();
		p_1.textContent = i;
		$.append($$anchor, p_1);
	});
	var node_2 = $.sibling(node_1, 2);
	$.each(node_2, 17, () => ({ length: count() }), $.index, ($$anchor, $$item, i) => {
		var span = root_1();
		span.textContent = i;
		$.append($$anchor, span);
	}, ($$anchor) => {
		$.next();
		var text = $.text("none");
		$.append($$anchor, text);
	});
	var node_3 = $.sibling(node_2, 2);
	$.each(node_3, 16, () => ({ length: 3 }), $.index, ($$anchor, $$item) => {
		var b = root_2();
		$.append($$anchor, b);
	});
	$.append($$anchor, fragment);
}
