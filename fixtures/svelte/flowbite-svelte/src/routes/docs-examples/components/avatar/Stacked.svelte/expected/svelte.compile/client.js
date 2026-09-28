import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar } from "flowbite-svelte";

var root = $.from_html(`<div class="mb-5 flex"><!> <!> <!> <!></div> <div class="flex"><!> <!> <!> <!></div>`, 1);

export default function Stacked($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Avatar(node, { src: '/images/profile-picture-1.webp', stacked: true });

	var node_1 = $.sibling(node, 2);

	Avatar(node_1, { src: '/images/profile-picture-2.webp', stacked: true });

	var node_2 = $.sibling(node_1, 2);

	Avatar(node_2, { src: '/images/profile-picture-3.webp', stacked: true });

	var node_3 = $.sibling(node_2, 2);

	Avatar(node_3, { stacked: true });
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_4 = $.child(div_1);

	Avatar(node_4, { src: '/images/profile-picture-1.webp', stacked: true });

	var node_5 = $.sibling(node_4, 2);

	Avatar(node_5, { src: '/images/profile-picture-2.webp', stacked: true });

	var node_6 = $.sibling(node_5, 2);

	Avatar(node_6, { src: '/images/profile-picture-3.webp', stacked: true });

	var node_7 = $.sibling(node_6, 2);

	Avatar(node_7, {
		stacked: true,
		href: '/',
		class: 'bg-gray-700 text-sm text-white hover:bg-gray-600',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('+99');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}