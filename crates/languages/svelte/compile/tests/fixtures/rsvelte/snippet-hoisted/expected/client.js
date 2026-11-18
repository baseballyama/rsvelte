import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import Icon from "./Icon.svelte";
const plain = ($$anchor) => {
	var fragment = root();
	var node = $.first_child(fragment);
	Icon(node, {});
	var text = $.sibling(node, 1, true);
	text.nodeValue = "hi";
	$.append($$anchor, fragment);
};
const calls_plain = ($$anchor) => {
	plain($$anchor);
};
const greeting = "hi";
var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<b> </b>`);
var root_2 = $.from_html(`<!> <p><!></p> <!>`, 1);
export default function Snippet_hoisted($$anchor, $$props) {
	const uses_prop = ($$anchor) => {
		var b = root_1();
		var text_1 = $.only_child(b, true);
		$.template_effect(() => $.set_text(text_1, $$props.name));
		$.append($$anchor, b);
	};
	var fragment_2 = root_2();
	var node_1 = $.first_child(fragment_2);
	plain(node_1);
	var p = $.sibling(node_1, 2);
	var node_2 = $.child(p);
	uses_prop(node_2);
	$.reset(p);
	var node_3 = $.sibling(p, 2);
	calls_plain(node_3);
	$.append($$anchor, fragment_2);
}
