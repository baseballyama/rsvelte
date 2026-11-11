import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import a from "./a.js";
const b = 1;
var root = $.from_html(`<p>1</p>`);
var root_1 = $.from_html(`<p>2</p>`);
var root_2 = $.from_html(`<!><!><!>`, 1);
export default function Snippet_named_like_import($$anchor) {
	const a = ($$anchor) => {
		var p = root();
		$.append($$anchor, p);
	};
	const b = ($$anchor) => {
		var p_1 = root_1();
		$.append($$anchor, p_1);
	};
	const c = ($$anchor) => {
		a($$anchor);
	};
	var fragment_1 = root_2();
	var node = $.first_child(fragment_1);
	a(node);
	var node_1 = $.sibling(node);
	b(node_1);
	var node_2 = $.sibling(node_1);
	c(node_2);
	$.append($$anchor, fragment_1);
}
