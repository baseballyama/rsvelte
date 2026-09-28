import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar } from "flowbite-svelte";

var root = $.from_html(`<div class=" flex flex-wrap justify-center space-x-4 rtl:space-x-reverse"><!> <!> <!> <!> <!> <!></div>`);

export default function Sizes($$anchor) {
	var div = root();
	var node = $.child(div);

	Avatar(node, { src: '/images/profile-picture-3.webp', size: 'xs' });

	var node_1 = $.sibling(node, 2);

	Avatar(node_1, { src: '/images/profile-picture-3.webp', size: 'sm' });

	var node_2 = $.sibling(node_1, 2);

	Avatar(node_2, { src: '/images/profile-picture-3.webp', size: 'md' });

	var node_3 = $.sibling(node_2, 2);

	Avatar(node_3, { src: '/images/profile-picture-3.webp', size: 'lg' });

	var node_4 = $.sibling(node_3, 2);

	Avatar(node_4, { src: '/images/profile-picture-3.webp', size: 'xl' });

	var node_5 = $.sibling(node_4, 2);

	Avatar(node_5, { src: '/images/profile-picture-3.webp', class: 'h-28 w-28' });
	$.reset(div);
	$.append($$anchor, div);
}