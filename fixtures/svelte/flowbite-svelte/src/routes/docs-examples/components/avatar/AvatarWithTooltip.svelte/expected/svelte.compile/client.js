import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar, Tooltip } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function AvatarWithTooltip($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Avatar(node, {
		'data-name': 'Jese Leos',
		src: '/images/profile-picture-1.webp'
	});

	var node_1 = $.sibling(node, 2);

	Tooltip(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Jese Leos');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Avatar(node_2, {
		'data-name': 'Robert Gouth',
		src: '/images/profile-picture-2.webp'
	});

	var node_3 = $.sibling(node_2, 2);

	Tooltip(node_3, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Robert Gouth');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Avatar(node_4, {
		'data-name': 'Bonnie Green',
		src: '/images/profile-picture-3.webp'
	});

	var node_5 = $.sibling(node_4, 2);

	Tooltip(node_5, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Bonnie Green');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}