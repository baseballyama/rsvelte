import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', { valid1: true, validPropWrongType1: true }, null);

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'default', { valid1: true, invalidProp1: true }, null);

	var node_2 = $.sibling(node_1, 2);

	$.slot(node_2, $$props, 'foo', { valid2: true, validPropWrongType2: true }, null);

	var node_3 = $.sibling(node_2, 2);

	$.slot(node_3, $$props, 'foo', { valid2: true, invalidProp2: true }, null);

	var node_4 = $.sibling(node_3, 2);

	$.slot(node_4, $$props, 'invalid', { prop: true }, null);
	$.append($$anchor, fragment);
}