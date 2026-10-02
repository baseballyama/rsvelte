import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/registry/ui/button/index.js";
import { Toggle } from "$lib/registry/ui/toggle/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex flex-col gap-4"><div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div></div>`);

export default function Toggle_with_button_text($$anchor) {
	Example($$anchor, {
		title: 'With Button Text',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var div_1 = $.child(div);
			var node = $.child(div_1);

			Button(node, {
				size: 'sm',
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Button');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Toggle(node_1, {
				variant: 'outline',
				'aria-label': 'Toggle sm',
				size: 'sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Toggle');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_2 = $.child(div_2);

			Button(node_2, {
				size: 'default',
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Button');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Toggle(node_3, {
				variant: 'outline',
				'aria-label': 'Toggle default',
				size: 'default',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Toggle');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_4 = $.child(div_3);

			Button(node_4, {
				size: 'lg',
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Button');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Toggle(node_5, {
				variant: 'outline',
				'aria-label': 'Toggle lg',
				size: 'lg',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Toggle');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}