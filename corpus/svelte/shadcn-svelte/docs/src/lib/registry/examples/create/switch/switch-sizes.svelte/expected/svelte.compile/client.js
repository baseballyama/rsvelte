import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label } from "$lib/registry/ui/label/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex flex-col gap-12"><div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div></div>`);

export default function Switch_sizes($$anchor) {
	Example($$anchor, {
		title: 'Sizes',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var div_1 = $.child(div);
			var node = $.child(div_1);

			Switch(node, { id: 'switch-size-sm', size: 'sm' });

			var node_1 = $.sibling(node, 2);

			Label(node_1, {
				for: 'switch-size-sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Small');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_2 = $.child(div_2);

			Switch(node_2, { id: 'switch-size-default', size: 'default' });

			var node_3 = $.sibling(node_2, 2);

			Label(node_3, {
				for: 'switch-size-default',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Default');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}