import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import SettingsIcon from '@lucide/svelte/icons/settings';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Settings_menu($$anchor) {
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
								SettingsIcon($$anchor, {
									class: 'text-muted-foreground',
									size: 16,
									'aria-hidden': 'true'
								});
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
					var fragment_4 = root();
					var node_2 = $.first_child(fragment_4);

					DropdownMenuItem(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Appearance');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					DropdownMenuItem(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Preferences');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					DropdownMenuItem(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('API Settings');

							$.append($$anchor, text_2);
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