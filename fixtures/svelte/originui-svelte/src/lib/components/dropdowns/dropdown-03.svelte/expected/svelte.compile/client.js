import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Bolt from '@lucide/svelte/icons/bolt';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import CopyPlus from '@lucide/svelte/icons/copy-plus';
import Files from '@lucide/svelte/icons/files';
import Layers2 from '@lucide/svelte/icons/layers-2';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

var root = $.from_html(`Menu with icons <!>`, 1);
var root_1 = $.from_html(`<!> Copy`, 1);
var root_2 = $.from_html(`<!> Edit`, 1);
var root_3 = $.from_html(`<!> Group`, 1);
var root_4 = $.from_html(`<!> Clone`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!>`, 1);

export default function Dropdown_03($$anchor) {
	DropdownMenu($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_6();
			var node = $.first_child(fragment_1);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_3 = root();
							var node_1 = $.sibling($.first_child(fragment_3));

							ChevronDown(node_1, { class: '-me-1 opacity-60', size: 16, 'aria-hidden': 'true' });
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					}));
				};

				DropdownMenuTrigger(node, { child, $$slots: { child: true } });
			}

			var node_2 = $.sibling(node, 2);

			DropdownMenuContent(node_2, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_5();
					var node_3 = $.first_child(fragment_4);

					DropdownMenuItem(node_3, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_1();
							var node_4 = $.first_child(fragment_5);

							CopyPlus(node_4, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$.next();
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_3, 2);

					DropdownMenuItem(node_5, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_2();
							var node_6 = $.first_child(fragment_6);

							Bolt(node_6, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$.next();
							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_5, 2);

					DropdownMenuItem(node_7, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_3();
							var node_8 = $.first_child(fragment_7);

							Layers2(node_8, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$.next();
							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_7, 2);

					DropdownMenuItem(node_9, {
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_4();
							var node_10 = $.first_child(fragment_8);

							Files(node_10, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$.next();
							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}