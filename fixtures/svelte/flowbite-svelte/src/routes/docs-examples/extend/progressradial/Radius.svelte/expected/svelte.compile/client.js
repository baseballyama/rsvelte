import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progressradial } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Radius($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Progressradial(node, { radius: 10 });

	var node_1 = $.sibling(node, 2);

	Progressradial(node_1, { radius: 15 });

	var node_2 = $.sibling(node_1, 2);

	Progressradial(node_2, { radius: 20 });

	var node_3 = $.sibling(node_2, 2);

	Progressradial(node_3, { radius: 25 });
	$.append($$anchor, fragment);
}