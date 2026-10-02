import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p><!> <!></p>`);

export default function Input($$anchor) {
	var p = root();
	var node = $.child(p);

	$.html(node, () => raw1);

	var node_1 = $.sibling(node, 2);

	$.html(node_1, () => raw2);
	$.reset(p);
	$.append($$anchor, p);
}