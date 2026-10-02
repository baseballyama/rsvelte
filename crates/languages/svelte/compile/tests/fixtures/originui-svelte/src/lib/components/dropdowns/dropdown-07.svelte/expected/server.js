import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

export default function Dropdown_07($$renderer) {
	let framework = 'sveltekit';

	DropdownMenu($$renderer, {
		children: ($$renderer) => {
			{
				function child($$renderer, { props }) {
					Button($$renderer, $.spread_props([
						{ variant: 'outline' },
						props,
						{
							children: ($$renderer) => {
								$$renderer.push(`<!---->Radio items `);
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
					DropdownMenuRadioGroup($$renderer, {
						value: framework,
						onValueChange: (value) => framework = value,
						children: ($$renderer) => {
							DropdownMenuRadioItem($$renderer, {
								value: 'sveltekit',
								children: ($$renderer) => {
									$$renderer.push(`<!---->SvelteKit`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenuRadioItem($$renderer, {
								value: 'nextjs',
								disabled: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Next.js`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenuRadioItem($$renderer, {
								value: 'remix',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Remix`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenuRadioItem($$renderer, {
								value: 'astro',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Astro`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}