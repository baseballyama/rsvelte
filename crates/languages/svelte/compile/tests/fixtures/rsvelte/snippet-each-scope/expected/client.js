import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<!> <!> `, 1);
export default function Snippet_each_scope($$anchor) {
	let s = "outer";
	var fragment = root_1();
	var node = $.first_child(fragment);
	$.each(node, 16, () => [1], $.index, ($$anchor, x, $$index, $$array) => {
		const s = ($$anchor) => {
			var p = root();
			var text = $.only_child(p, true);
			$.template_effect(() => $.set_text(text, x));
			$.append($$anchor, p);
		};
		s($$anchor);
	});
	var node_1 = $.sibling(node, 2);
	$.each(node_1, 16, () => [2], $.index, ($$anchor, y) => {
		var p_1 = root();
		var text_1 = $.only_child(p_1, true);
		$.template_effect(() => $.set_text(text_1, y));
		$.append($$anchor, p_1);
	});
	var text_2 = $.sibling(node_1);
	text_2.nodeValue = " outer";
	$.append($$anchor, fragment);
}
