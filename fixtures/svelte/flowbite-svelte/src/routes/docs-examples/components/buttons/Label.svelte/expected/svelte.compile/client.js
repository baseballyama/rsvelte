import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Indicator } from "flowbite-svelte";

var root = $.from_html(`Messages <!>`, 1);

export default function Label($$anchor) {
	Button($$anchor, {
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node = $.sibling($.first_child(fragment_1));

			Indicator(node, {
				class: 'bg-primary-200 text-primary-800 text-xs font-semibold',
				size: 'lg',
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