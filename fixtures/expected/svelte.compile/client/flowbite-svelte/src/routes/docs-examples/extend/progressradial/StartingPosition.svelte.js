import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progressradial } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function StartingPosition($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Progressradial(node, {});

	var node_1 = $.sibling(node, 2);

	Progressradial(node_1, { progress: 50, startingPosition: 'right' });

	var node_2 = $.sibling(node_1, 2);

	Progressradial(node_2, { progress: 50, startingPosition: 'bottom' });

	var node_3 = $.sibling(node_2, 2);

	Progressradial(node_3, { progress: 50, startingPosition: 'left' });
	$.append($$anchor, fragment);
}