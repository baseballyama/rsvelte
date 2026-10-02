import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.key(node, () => hi, ($$anchor) => {
		var text = $.text();

		text.nodeValue = hi;
		$.append($$anchor, text);
	});

	var node_1 = $.sibling(node, 2);

	$.key(node_1, () => hi, ($$anchor) => {
		var text_1 = $.text();

		text_1.nodeValue = hi;
		$.append($$anchor, text_1);
	});

	$.append($$anchor, fragment);
}