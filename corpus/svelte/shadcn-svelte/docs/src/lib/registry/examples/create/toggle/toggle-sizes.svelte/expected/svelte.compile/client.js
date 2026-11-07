import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toggle } from "$lib/registry/ui/toggle/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex flex-wrap items-center gap-2"><!> <!> <!></div>`);

export default function Toggle_sizes($$anchor) {
	Example($$anchor, {
		title: 'Sizes',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			Toggle(node, {
				variant: 'outline',
				'aria-label': 'Toggle small',
				size: 'sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Small');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Toggle(node_1, {
				variant: 'outline',
				'aria-label': 'Toggle default',
				size: 'default',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Default');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Toggle(node_2, {
				variant: 'outline',
				'aria-label': 'Toggle large',
				size: 'lg',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Large');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}