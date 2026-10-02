import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function _2_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.key(node, () => value, ($$anchor) => {
		var div = root();

		div.textContent = value;
		$.transition(3, div, () => fade);
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
}