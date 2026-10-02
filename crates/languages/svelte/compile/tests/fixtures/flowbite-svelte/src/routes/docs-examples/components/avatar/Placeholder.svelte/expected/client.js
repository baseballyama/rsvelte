import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Placeholder($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Avatar(node, {});

	var node_1 = $.sibling(node, 2);

	Avatar(node_1, { cornerStyle: 'rounded' });

	var node_2 = $.sibling(node_1, 2);

	Avatar(node_2, { border: true });

	var node_3 = $.sibling(node_2, 2);

	Avatar(node_3, { cornerStyle: 'rounded', border: true });
	$.append($$anchor, fragment);
}