import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

var root = $.from_html(`Same width of trigger <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Dropdown_02($$anchor) {
	DropdownMenu($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
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
				class: 'min-w-(--bits-dropdown-menu-anchor-width)',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_3 = $.first_child(fragment_4);

					DropdownMenuItem(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Option 1');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					DropdownMenuItem(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Option 2');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					DropdownMenuItem(node_5, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Option 3');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					DropdownMenuItem(node_6, {
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