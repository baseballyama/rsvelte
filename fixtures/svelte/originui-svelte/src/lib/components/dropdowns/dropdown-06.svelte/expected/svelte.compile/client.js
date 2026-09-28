import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

var root = $.from_html(`Checkbox items <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Dropdown_06($$anchor) {
	let sveltekit = $.state(true);
	let remix = $.state(false);
	let nextjs = $.state(false);
	let astro = $.state(true);

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
					var fragment_4 = root_1();
					var node_3 = $.first_child(fragment_4);

					DropdownMenuCheckboxItem(node_3, {
						get checked() {
							return $.get(sveltekit);
						},
						onCheckedChange: (checked) => $.set(sveltekit, checked, true),
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('SvelteKit');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					DropdownMenuCheckboxItem(node_4, {
						get checked() {
							return $.get(nextjs);
						},
						onCheckedChange: (checked) => $.set(nextjs, checked, true),
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Next.js');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					DropdownMenuCheckboxItem(node_5, {
						get checked() {
							return $.get(remix);
						},
						onCheckedChange: (checked) => $.set(remix, checked, true),
						disabled: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Remix');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					DropdownMenuCheckboxItem(node_6, {
						get checked() {
							return $.get(astro);
						},
						onCheckedChange: (checked) => $.set(astro, checked, true),
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Astro');

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