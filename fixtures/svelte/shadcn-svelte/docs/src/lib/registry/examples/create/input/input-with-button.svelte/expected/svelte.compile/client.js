import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Button from "$lib/registry/ui/button/index.js";
import * as Input from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex w-full gap-2"><!> <!></div>`);

export default function Input_with_button($$anchor) {
	Example($$anchor, {
		title: 'With Button',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			$.component(node, () => Input.Root, ($$anchor, Input_Root) => {
				Input_Root($$anchor, { type: 'search', placeholder: 'Search...', class: 'flex-1' });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Button.Root, ($$anchor, Button_Root) => {
				Button_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Search');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}