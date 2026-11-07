import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toggle } from "$lib/registry/ui/toggle/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex flex-wrap items-center gap-2"><!> <!></div>`);

export default function Toggle_disabled($$anchor) {
	Example($$anchor, {
		title: 'Disabled',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			Toggle(node, {
				'aria-label': 'Toggle disabled',
				disabled: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Disabled');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Toggle(node_1, {
				variant: 'outline',
				'aria-label': 'Toggle disabled outline',
				disabled: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Disabled');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}