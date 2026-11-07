import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import UserAvatar from "carbon-components-svelte/UserAvatar/UserAvatar.svelte";
import Add from "carbon-icons-svelte/lib/Add.svelte";

var root = $.from_html(`<span>custom content</span>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function UserAvatar_test($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	UserAvatar(node, { 'data-testid': 'default' });

	var node_1 = $.sibling(node, 2);

	UserAvatar(node_1, { 'data-testid': 'initials-single', name: 'Eric' });

	var node_2 = $.sibling(node_1, 2);

	UserAvatar(node_2, { 'data-testid': 'initials-multi', name: 'John Doe' });

	var node_3 = $.sibling(node_2, 2);

	UserAvatar(node_3, {
		'data-testid': 'initials-override',
		name: 'John Doe',
		initials: 'XY'
	});

	var node_4 = $.sibling(node_3, 2);

	UserAvatar(node_4, {
		'data-testid': 'image',
		name: 'Should Not Show',
		image: 'https://example.com/photo.jpg',
		imageDescription: 'A user photo'
	});

	var node_5 = $.sibling(node_4, 2);

	UserAvatar(node_5, {
		'data-testid': 'image-attributes',
		'data-avatar-host': 'true',
		name: 'Should Not Show',
		image: 'https://example.com/photo.jpg',
		imageDescription: 'A user photo',
		imageAttributes: {
			loading: "lazy",
			srcset: "https://example.com/photo.jpg 1x",
			referrerPolicy: "no-referrer"
		}
	});

	var node_6 = $.sibling(node_5, 2);

	UserAvatar(node_6, {
		'data-testid': 'icon',
		name: 'Should Not Show',
		get icon() {
			return Add;
		}
	});

	var node_7 = $.sibling(node_6, 2);

	UserAvatar(node_7, { 'data-testid': 'size-lg', size: 'lg', name: 'John Doe' });

	var node_8 = $.sibling(node_7, 2);

	UserAvatar(node_8, {
		'data-testid': 'color-blue',
		backgroundColor: 'blue',
		name: 'John Doe'
	});

	var node_9 = $.sibling(node_8, 2);

	UserAvatar(node_9, {
		'data-testid': 'color-cool-gray',
		backgroundColor: 'cool-gray',
		name: 'John Doe'
	});

	var node_10 = $.sibling(node_9, 2);

	UserAvatar(node_10, {
		'data-testid': 'color-auto',
		backgroundColor: 'auto',
		name: 'John Doe'
	});

	var node_11 = $.sibling(node_10, 2);

	UserAvatar(node_11, {
		'data-testid': 'color-auto-2',
		backgroundColor: 'auto',
		name: 'John Doe'
	});

	var node_12 = $.sibling(node_11, 2);

	UserAvatar(node_12, {
		'data-testid': 'tooltip',
		name: 'Jane Roe',
		tooltipText: 'Jane Roe'
	});

	var node_13 = $.sibling(node_12, 2);

	UserAvatar(node_13, {
		'data-testid': 'tooltip-inline',
		name: 'Jane Roe',
		tooltipText: 'Jane Roe',
		portalTooltip: false
	});

	var node_14 = $.sibling(node_13, 2);

	UserAvatar(node_14, {
		'data-testid': 'events',
		name: 'John Doe',
		$$events: {
			click: () => console.log("click"),
			mouseenter: () => console.log("mouseenter")
		}
	});

	var node_15 = $.sibling(node_14, 2);

	UserAvatar(node_15, {
		'data-testid': 'slot',
		name: 'John Doe',
		children: ($$anchor, $$slotProps) => {
			var span = root();

			$.append($$anchor, span);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_15, 2);

	UserAvatar(node_16, {
		'data-testid': 'custom-class',
		class: 'my-class',
		name: 'John Doe'
	});

	var node_17 = $.sibling(node_16, 2);

	UserAvatar(node_17, {
		'data-testid': 'tooltip-overflow-marker',
		'data-avatar-group-overflow': 'true',
		name: 'Jane Roe',
		tooltipText: 'Jane Roe'
	});

	var node_18 = $.sibling(node_17, 2);

	UserAvatar(node_18, {
		'data-testid': 'interactive',
		interactive: true,
		name: 'John Doe'
	});

	var node_19 = $.sibling(node_18, 2);

	UserAvatar(node_19, { 'data-testid': 'href', href: '/profile', name: 'John Doe' });

	var node_20 = $.sibling(node_19, 2);

	UserAvatar(node_20, {
		'data-testid': 'href-over-interactive',
		href: '/profile',
		interactive: true,
		name: 'John Doe'
	});

	$.append($$anchor, fragment);
}