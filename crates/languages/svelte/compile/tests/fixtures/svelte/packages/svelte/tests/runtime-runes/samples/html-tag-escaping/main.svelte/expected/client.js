import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!> `, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.html(node, () => `\u{73}`);

	var node_1 = $.sibling(node, 2);

	$.html(node_1, () => '\u{73}');

	var node_2 = $.sibling(node_1, 2);

	$.html(node_2, () => "\u{73}");

	var text = $.sibling(node_2);

	text.nodeValue = ' \\u73';
	$.append($$anchor, fragment);
}