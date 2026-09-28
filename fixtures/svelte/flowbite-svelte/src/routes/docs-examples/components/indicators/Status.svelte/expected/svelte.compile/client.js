import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Status($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Avatar(node, {
		src: '/images/profile-picture-5.webp',
		dot: { color: "green", size: "lg", placement: "top-right" }
	});

	var node_1 = $.sibling(node, 2);

	Avatar(node_1, {
		src: '/images/profile-picture-5.webp',
		dot: { color: "red", size: "lg", placement: "top-right" }
	});

	$.append($$anchor, fragment);
}