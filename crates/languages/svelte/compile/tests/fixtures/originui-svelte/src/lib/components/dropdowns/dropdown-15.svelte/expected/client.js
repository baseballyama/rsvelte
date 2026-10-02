import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Monitor from '@lucide/svelte/icons/monitor';
import Moon from '@lucide/svelte/icons/moon';
import Sun from '@lucide/svelte/icons/sun';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

var root = $.from_html(`<!> <span>Light</span>`, 1);
var root_1 = $.from_html(`<!> <span>Dark</span>`, 1);
var root_2 = $.from_html(`<!> <span>System</span>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<div><!></div>`);

export default function Dropdown_15($$anchor) {
	const systemPreference = 'light';
	let theme = $.state('light');
	const displayTheme = $.derived(() => $.get(theme) === 'system' ? systemPreference : $.get(theme));

	const Icon = $.derived(() => {
		if ($.get(displayTheme) === 'light') return Sun;
		if ($.get(displayTheme) === 'dark') return Moon;
	});

	var div = root_5();
	var node = $.child(div);

	DropdownMenu(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_4();
			var node_1 = $.first_child(fragment);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props(
						{
							size: 'icon',
							variant: 'outline',
							'aria-label': 'Select theme'
						},
						props,
						{
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_2 = $.first_child(fragment_2);

								$.component(node_2, () => $.get(Icon), ($$anchor, Icon_1) => {
									Icon_1($$anchor, { size: 16, 'aria-hidden': 'true' });
								});

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						}
					));
				};

				DropdownMenuTrigger(node_1, { child, $$slots: { child: true } });
			}

			var node_3 = $.sibling(node_1, 2);

			DropdownMenuContent(node_3, {
				class: 'min-w-32',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_3();
					var node_4 = $.first_child(fragment_3);

					DropdownMenuItem(node_4, {
						onSelect: () => $.set(theme, 'light'),
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_5 = $.first_child(fragment_4);

							Sun(node_5, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$.next(2);
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_4, 2);

					DropdownMenuItem(node_6, {
						onSelect: () => $.set(theme, 'dark'),
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_1();
							var node_7 = $.first_child(fragment_5);

							Moon(node_7, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$.next(2);
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_6, 2);

					DropdownMenuItem(node_8, {
						onSelect: () => $.set(theme, 'system'),
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_2();
							var node_9 = $.first_child(fragment_6);

							Monitor(node_9, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$.next(2);
							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}