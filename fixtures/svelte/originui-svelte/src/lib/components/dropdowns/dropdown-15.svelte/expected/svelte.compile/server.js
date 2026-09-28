import * as $ from 'svelte/internal/server';
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

export default function Dropdown_15($$renderer) {
	const systemPreference = 'light';
	let theme = 'light';
	const displayTheme = $.derived(() => theme === 'system' ? systemPreference : theme);

	const Icon = $.derived(() => {
		if (displayTheme() === 'light') return Sun;
		if (displayTheme() === 'dark') return Moon;
	});

	$$renderer.push(`<div>`);

	DropdownMenu($$renderer, {
		children: ($$renderer) => {
			{
				function child($$renderer, { props }) {
					Button($$renderer, $.spread_props([
						{
							size: 'icon',
							variant: 'outline',
							'aria-label': 'Select theme'
						},
						props,
						{
							children: ($$renderer) => {
								if (Icon()) {
									$$renderer.push('<!--[-->');
									Icon()($$renderer, { size: 16, 'aria-hidden': 'true' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						}
					]));
				}

				DropdownMenuTrigger($$renderer, { child, $$slots: { child: true } });
			}

			$$renderer.push(`<!----> `);

			DropdownMenuContent($$renderer, {
				class: 'min-w-32',
				children: ($$renderer) => {
					DropdownMenuItem($$renderer, {
						onSelect: () => theme = 'light',
						children: ($$renderer) => {
							Sun($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$$renderer.push(`<!----> <span>Light</span>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownMenuItem($$renderer, {
						onSelect: () => theme = 'dark',
						children: ($$renderer) => {
							Moon($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$$renderer.push(`<!----> <span>Dark</span>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownMenuItem($$renderer, {
						onSelect: () => theme = 'system',
						children: ($$renderer) => {
							Monitor($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$$renderer.push(`<!----> <span>System</span>`);
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

	$$renderer.push(`<!----></div>`);
}