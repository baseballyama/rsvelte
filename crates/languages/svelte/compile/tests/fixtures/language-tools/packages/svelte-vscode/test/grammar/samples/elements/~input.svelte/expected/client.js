import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/><!> <input/><div></div> <!><!> <!><!> <div></div><p></p> <!>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment));

	Component(node, {});

	var node_1 = $.sibling(node, 5);

	$.slot(node_1, $$props, 'default', {}, null);

	var node_2 = $.sibling(node_1);

	Component(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	Component(node_3, {});

	var node_4 = $.sibling(node_3);

	Component(node_4, {});

	var node_5 = $.sibling(node_4, 5);

	A(node_5, {});
	$.append($$anchor, fragment);
}