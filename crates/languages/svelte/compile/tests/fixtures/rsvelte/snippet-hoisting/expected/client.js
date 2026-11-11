import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
const typed = ($$anchor, item = $.noop) => {
	var p_1 = root();
	var text_1 = $.only_child(p_1, true);
	$.template_effect(() => $.set_text(text_1, item().label));
	$.append($$anchor, p_1);
};
var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<!> <!>`, 1);
export default function Snippet_hoisting($$anchor, $$props) {
	const reaches = ($$anchor) => {
		blocked($$anchor);
	};
	const blocked = ($$anchor) => {
		var p = root();
		var text = $.only_child(p, true);
		$.template_effect(() => $.set_text(text, $$props.name));
		$.append($$anchor, p);
	};
	var fragment_1 = root_1();
	var node = $.first_child(fragment_1);
	reaches(node);
	var node_1 = $.sibling(node, 2);
	typed(node_1, () => ({ label: "a" }));
	$.append($$anchor, fragment_1);
}
