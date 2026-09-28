import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progressradial } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Thickness($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Progressradial(node, {});

	var node_1 = $.sibling(node, 2);

	Progressradial(node_1, { thickness: 5 });

	var node_2 = $.sibling(node_1, 2);

	Progressradial(node_2, { thickness: 10 });

	var node_3 = $.sibling(node_2, 2);

	Progressradial(node_3, { thickness: 15 });
	$.append($$anchor, fragment);
}