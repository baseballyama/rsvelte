import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);

	$.attach(div, () => x);

	var div_1 = $.sibling(div, 2);

	$.attach(div_1, () => (node) => {});

	var node_1 = $.sibling(div_1, 2);

	Comp(node_1, { [$.attachment()]: x });

	var node_2 = $.sibling(node_1, 2);

	Comp(node_2, { [$.attachment()]: (node) => {} });
	$.append($$anchor, fragment);
}