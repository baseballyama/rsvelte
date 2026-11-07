import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.element(node, () => tag, false);

	var node_1 = $.sibling(node, 2);

	$.element(node_1, () => tag, false, ($$element_1, $$anchor) => {
		$.set_class($$element_1, 0, 'foo');
	});

	$.append($$anchor, fragment);
}