import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar } from "flowbite-svelte";

var root = $.from_html(`<div class="flex space-x-4 rtl:space-x-reverse"><!> <!></div>`);

export default function Default($$anchor) {
	var div = root();
	var node = $.child(div);

	Avatar(node, { src: '/images/profile-picture-2.webp' });

	var node_1 = $.sibling(node, 2);

	Avatar(node_1, {
		src: '/images/profile-picture-2.webp',
		cornerStyle: 'rounded'
	});

	$.reset(div);
	$.append($$anchor, div);
}