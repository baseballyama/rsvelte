import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge, Button } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Opening($$anchor) {
	let openBadgeStatus = $.state(false);

	function openBadge() {
		$.set(openBadgeStatus, true);
	}

	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: openBadge,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Open badge');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Badge(node_1, {
		class: 'ml-4',
		color: 'blue',
		dismissable: true,
		large: true,
		get badgeStatus() {
			return $.get(openBadgeStatus);
		},

		set badgeStatus($$value) {
			$.set(openBadgeStatus, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Default');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}