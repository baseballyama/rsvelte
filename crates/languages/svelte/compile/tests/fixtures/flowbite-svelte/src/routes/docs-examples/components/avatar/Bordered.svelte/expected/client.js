import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Bordered($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Avatar(node, { src: '/images/profile-picture-2.webp', border: true });

	var node_1 = $.sibling(node, 2);

	Avatar(node_1, {
		src: '/images/profile-picture-2.webp',
		border: true,
		class: 'ring-red-400 dark:ring-red-300'
	});

	$.append($$anchor, fragment);
}