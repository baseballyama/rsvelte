import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Like`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Button_group_with_like($$anchor) {
	Example($$anchor, {
		title: 'With Like',
		children: ($$anchor, $$slotProps) => {
			ButtonGroup($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node = $.first_child(fragment_2);

					Button(node, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_1 = $.first_child(fragment_3);

							IconPlaceholder(node_1, {
								lucide: 'HeartIcon',
								tabler: 'IconBell',
								hugeicons: 'Notification02Icon',
								phosphor: 'HeartIcon',
								remixicon: 'RiHeartLine',
								'data-icon': 'inline-start'
							});

							$.next();
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node, 2);

					Button(node_2, {
						variant: 'outline',
						size: 'icon',
						class: 'w-12',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('1.2K');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}