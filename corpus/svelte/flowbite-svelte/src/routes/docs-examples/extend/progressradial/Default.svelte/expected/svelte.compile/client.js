import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progressradial } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Default($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Progressradial(node, { progress: 20 });

	var node_1 = $.sibling(node, 2);

	Progressradial(node_1, { progress: '40' });

	var node_2 = $.sibling(node_1, 2);

	Progressradial(node_2, { progress: 65 });

	var node_3 = $.sibling(node_2, 2);

	Progressradial(node_3, { progress: '83' });
	$.append($$anchor, fragment);
}