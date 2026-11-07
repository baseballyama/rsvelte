import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);

export default function Inner($$anchor, $$props) {
	function setKey(key, value) {
		console.log(`setKey(${key}, ${value})`);
	}

	var fragment = root();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', { key: 'a', set: setKey }, null);

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'default', { key: 'b', set: setKey }, null);
	$.append($$anchor, fragment);
}