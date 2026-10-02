import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const snippet = ($$anchor) => {
	var p = root();

	$.append($$anchor, p);
};

var root = $.from_html(`<p>hello world</p>`);

export default function Main($$anchor, $$props) {
	const children = $.prop($$props, 'children', 3, snippet);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, children);
	$.append($$anchor, fragment);
}