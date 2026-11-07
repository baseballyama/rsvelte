import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Test_output($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Custom(node, { foo: 'bar' });

	var node_1 = $.sibling(node, 2);

	Custom(node_1, { foo: 'bar' });

	var node_2 = $.sibling(node_1, 2);

	Custom(node_2, { foo: 'bar' });
	$.append($$anchor, fragment);
}