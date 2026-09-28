import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Heading, Badge } from "flowbite-svelte";

var root = $.from_html(`Flowbite <!>`, 1);

export default function Badge_1($$anchor) {
	Heading($$anchor, {
		tag: 'h1',
		class: 'flex items-center text-5xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node = $.sibling($.first_child(fragment_1));

			Badge(node, {
				class: 'ms-2 text-2xl font-semibold',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('PRO');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}