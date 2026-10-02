import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progressradial } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Size($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Progressradial(node, { size: 'w-20 h-20' });

	var node_1 = $.sibling(node, 2);

	Progressradial(node_1, { size: 'w-28 h-28' });

	var node_2 = $.sibling(node_1, 2);

	Progressradial(node_2, { size: 'w-32 h-32' });

	var node_3 = $.sibling(node_2, 2);

	Progressradial(node_3, { size: 'w-40 h-40' });
	$.append($$anchor, fragment);
}