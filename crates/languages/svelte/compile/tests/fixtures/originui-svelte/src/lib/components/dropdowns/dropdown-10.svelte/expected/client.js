import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import CircleUserRound from '@lucide/svelte/icons/circle-user-round';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

var root = $.from_html(`<span>Signed in as</span> <span class="text-foreground text-xs font-normal">k.kennedy@originui-svelte.com</span>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Dropdown_10($$anchor) {
	DropdownMenu($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props(
						{
							size: 'icon',
							variant: 'outline',
							'aria-label': 'Open account menu'
						},
						props,
						{
							children: ($$anchor, $$slotProps) => {
								CircleUserRound($$anchor, { size: 16, 'aria-hidden': 'true' });
							},
							$$slots: { default: true }
						}
					));
				};

				DropdownMenuTrigger(node, { child, $$slots: { child: true } });
			}

			var node_1 = $.sibling(node, 2);

			DropdownMenuContent(node_1, {
				class: 'max-w-64',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_2 = $.first_child(fragment_4);

					DropdownMenuLabel(node_2, {
						class: 'flex flex-col',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root();

							$.next(2);
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					DropdownMenuSeparator(node_3, {});

					var node_4 = $.sibling(node_3, 2);

					DropdownMenuGroup(node_4, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_1();
							var node_5 = $.first_child(fragment_6);

							DropdownMenuItem(node_5, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Option 1');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							DropdownMenuItem(node_6, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Option 2');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							DropdownMenuItem(node_7, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Option 3');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_4, 2);

					DropdownMenuSeparator(node_8, {});

					var node_9 = $.sibling(node_8, 2);

					DropdownMenuItem(node_9, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Logout');

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