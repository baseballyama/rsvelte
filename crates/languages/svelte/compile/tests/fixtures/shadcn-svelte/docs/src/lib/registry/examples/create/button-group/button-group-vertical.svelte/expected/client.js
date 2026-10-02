import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex gap-6"><!></div>`);

export default function Button_group_vertical($$anchor) {
	Example($$anchor, {
		title: 'Vertical',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.child(div);

			ButtonGroup(node, {
				orientation: 'vertical',
				'aria-label': 'Media controls',
				class: 'h-fit',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					Button(node_1, {
						variant: 'outline',
						size: 'icon',
						children: ($$anchor, $$slotProps) => {
							IconPlaceholder($$anchor, {
								lucide: 'PlusIcon',
								tabler: 'IconPlus',
								hugeicons: 'PlusSignIcon',
								phosphor: 'PlusIcon',
								remixicon: 'RiAddLine'
							});
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Button(node_2, {
						variant: 'outline',
						size: 'icon',
						children: ($$anchor, $$slotProps) => {
							IconPlaceholder($$anchor, {
								lucide: 'MinusIcon',
								tabler: 'IconMinus',
								hugeicons: 'MinusSignIcon',
								phosphor: 'MinusIcon',
								remixicon: 'RiSubtractLine'
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}