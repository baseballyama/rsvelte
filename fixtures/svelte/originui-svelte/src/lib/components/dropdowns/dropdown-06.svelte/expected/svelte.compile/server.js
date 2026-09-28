import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

export default function Dropdown_06($$renderer) {
	let sveltekit = true;
	let remix = false;
	let nextjs = false;
	let astro = true;

	DropdownMenu($$renderer, {
		children: ($$renderer) => {
			{
				function child($$renderer, { props }) {
					Button($$renderer, $.spread_props([
						{ variant: 'outline' },
						props,
						{
							children: ($$renderer) => {
								$$renderer.push(`<!---->Checkbox items `);
								ChevronDown($$renderer, { class: '-me-1 opacity-60', size: 16, 'aria-hidden': 'true' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						}
					]));
				}

				DropdownMenuTrigger($$renderer, { child, $$slots: { child: true } });
			}

			$$renderer.push(`<!----> `);

			DropdownMenuContent($$renderer, {
				children: ($$renderer) => {
					DropdownMenuCheckboxItem($$renderer, {
						checked: sveltekit,
						onCheckedChange: (checked) => sveltekit = checked,
						children: ($$renderer) => {
							$$renderer.push(`<!---->SvelteKit`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownMenuCheckboxItem($$renderer, {
						checked: nextjs,
						onCheckedChange: (checked) => nextjs = checked,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Next.js`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownMenuCheckboxItem($$renderer, {
						checked: remix,
						onCheckedChange: (checked) => remix = checked,
						disabled: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Remix`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownMenuCheckboxItem($$renderer, {
						checked: astro,
						onCheckedChange: (checked) => astro = checked,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Astro`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}