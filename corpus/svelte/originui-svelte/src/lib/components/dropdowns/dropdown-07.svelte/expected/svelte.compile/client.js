import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

var root = $.from_html(`Radio items <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Dropdown_07($$anchor) {
	let framework = $.state('sveltekit');

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
				children: ($$anchor, $$slotProps) => {
					DropdownMenuRadioGroup($$anchor, {
						get value() {
							return $.get(framework);
						},
						onValueChange: (value) => $.set(framework, value, true),
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_1();
							var node_3 = $.first_child(fragment_5);

							DropdownMenuRadioItem(node_3, {
								value: 'sveltekit',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('SvelteKit');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							DropdownMenuRadioItem(node_4, {
								value: 'nextjs',
								disabled: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Next.js');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_5 = $.sibling(node_4, 2);

							DropdownMenuRadioItem(node_5, {
								value: 'remix',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Remix');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							DropdownMenuRadioItem(node_6, {
								value: 'astro',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Astro');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}