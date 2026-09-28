import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge, Button } from "flowbite-svelte";

var root = $.from_html(`Messages <!>`, 1);

export default function ButtonBadge($$anchor) {
	Button($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node = $.sibling($.first_child(fragment_1));

			Badge(node, {
				rounded: true,
				class: 'text-primary-800 dark:text-primary-800 ms-2 h-4 w-4 bg-white p-0 font-semibold dark:bg-white',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('2');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}