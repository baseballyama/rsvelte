import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <!>`, 1);

export default function Main($$anchor) {
	/** @param {HTMLInputElement} node */
	function action(node) {
		node.value = 'set from action';
	}

	var fragment = root();
	var input = $.first_child(fragment);

	$.action(input, ($$node) => action?.($$node));

	var node_1 = $.sibling(input, 2);

	$.element(node_1, () => 'input', false, ($$element, $$anchor) => {
		$.action($$element, ($$node) => action?.($$node));
	});

	$.append($$anchor, fragment);
}