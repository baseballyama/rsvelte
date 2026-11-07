import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Ellipsis from '@lucide/svelte/icons/ellipsis';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Dropdown_01($$anchor) {
	DropdownMenu($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props(
						{
							size: 'icon',
							variant: 'ghost',
							class: 'rounded-full shadow-none',
							'aria-label': 'Open edit menu'
						},
						props,
						{
							children: ($$anchor, $$slotProps) => {
								Ellipsis($$anchor, { size: 16, 'aria-hidden': 'true' });
							},
							$$slots: { default: true }
						}
					));
				};

				DropdownMenuTrigger(node, { child, $$slots: { child: true } });
			}

			var node_1 = $.sibling(node, 2);

			DropdownMenuContent(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_2 = $.first_child(fragment_4);

					DropdownMenuItem(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Option 1');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					DropdownMenuItem(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Option 2');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					DropdownMenuItem(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Option 3');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					DropdownMenuItem(node_5, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Option 4');

							$.append($$anchor, text_3);
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