import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Links($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Badge(node, {
		href: '/',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Badge link');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Badge(node_1, {
		href: '/',
		large: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Badge link');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Badge(node_2, {
		href: '/',
		border: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Badge link');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Badge(node_3, {
		href: '/',
		rounded: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Badge link');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}