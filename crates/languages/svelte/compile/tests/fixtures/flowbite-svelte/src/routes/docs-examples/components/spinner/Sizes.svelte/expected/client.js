import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Spinner } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Sizes($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Spinner(node, { size: '4' });

	var node_1 = $.sibling(node, 2);

	Spinner(node_1, { size: '6' });

	var node_2 = $.sibling(node_1, 2);

	Spinner(node_2, { size: '8' });
	$.append($$anchor, fragment);
}