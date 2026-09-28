import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Spinner } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Type($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Spinner(node, { type: 'default', color: 'primary' });

	var node_1 = $.sibling(node, 2);

	Spinner(node_1, { type: 'dots', color: 'emerald' });

	var node_2 = $.sibling(node_1, 2);

	Spinner(node_2, { type: 'bars', color: 'blue' });

	var node_3 = $.sibling(node_2, 2);

	Spinner(node_3, { type: 'orbit', color: 'rose' });

	var node_4 = $.sibling(node_3, 2);

	Spinner(node_4, { type: 'pulse', color: 'green' });
	$.append($$anchor, fragment);
}