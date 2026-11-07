import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Heading, Secondary } from "flowbite-svelte";

var root = $.from_html(`Flowbite <!>`, 1);

export default function Secondary_1($$anchor) {
	Heading($$anchor, {
		tag: 'h1',
		class: 'text-5xl font-extrabold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node = $.sibling($.first_child(fragment_1));

			Secondary(node, {
				class: 'ms-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('This is secondary text');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}