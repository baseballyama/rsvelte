import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function DotIndicator($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Avatar(node, { src: '/images/profile-picture-3.webp', dot: { color: "red" } });

	var node_1 = $.sibling(node, 2);

	Avatar(node_1, {
		src: '/images/profile-picture-3.webp',
		dot: { placement: "top-right", color: "red" },
		cornerStyle: 'rounded'
	});

	var node_2 = $.sibling(node_1, 2);

	Avatar(node_2, {
		src: '/images/profile-picture-5.webp',
		dot: { placement: "bottom-right", color: "green" }
	});

	var node_3 = $.sibling(node_2, 2);

	Avatar(node_3, {
		src: '/images/profile-picture-5.webp',
		dot: { placement: "bottom-right" },
		cornerStyle: 'rounded'
	});

	var node_4 = $.sibling(node_3, 2);

	Avatar(node_4, { dot: {} });
	$.append($$anchor, fragment);
}