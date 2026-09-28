import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-4"><!> <!></div>`);

export default function Button_group_with_input($$anchor) {
	Example($$anchor, {
		title: 'With Input',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.child(div);

			ButtonGroup(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					Button(node_1, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Button');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Input(node_2, { placeholder: 'Type something here...' });
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			ButtonGroup(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_4 = $.first_child(fragment_2);

					Input(node_4, { placeholder: 'Type something here...' });

					var node_5 = $.sibling(node_4, 2);

					Button(node_5, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Button');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}