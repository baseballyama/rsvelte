import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Spinner } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Colors($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Spinner(node, {});

	var node_1 = $.sibling(node, 2);

	Spinner(node_1, { color: 'gray' });

	var node_2 = $.sibling(node_1, 2);

	Spinner(node_2, { color: 'green' });

	var node_3 = $.sibling(node_2, 2);

	Spinner(node_3, { color: 'red' });

	var node_4 = $.sibling(node_3, 2);

	Spinner(node_4, { color: 'yellow' });

	var node_5 = $.sibling(node_4, 2);

	Spinner(node_5, { color: 'pink' });

	var node_6 = $.sibling(node_5, 2);

	Spinner(node_6, { color: 'purple' });
	$.append($$anchor, fragment);
}