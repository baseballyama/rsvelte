import * as $ from 'svelte/internal/server';
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

export default function Dropdown_10($$renderer) {
	DropdownMenu($$renderer, {
		children: ($$renderer) => {
			{
				function child($$renderer, { props }) {
					Button($$renderer, $.spread_props([
						{
							size: 'icon',
							variant: 'outline',
							'aria-label': 'Open account menu'
						},
						props,
						{
							children: ($$renderer) => {
								CircleUserRound($$renderer, { size: 16, 'aria-hidden': 'true' });
							},
							$$slots: { default: true }
						}
					]));
				}

				DropdownMenuTrigger($$renderer, { child, $$slots: { child: true } });
			}

			$$renderer.push(`<!----> `);

			DropdownMenuContent($$renderer, {
				class: 'max-w-64',
				children: ($$renderer) => {
					DropdownMenuLabel($$renderer, {
						class: 'flex flex-col',
						children: ($$renderer) => {
							$$renderer.push(`<span>Signed in as</span> <span class="text-foreground text-xs font-normal">k.kennedy@originui-svelte.com</span>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					DropdownMenuSeparator($$renderer, {});
					$$renderer.push(`<!----> `);

					DropdownMenuGroup($$renderer, {
						children: ($$renderer) => {
							DropdownMenuItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Option 1`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenuItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Option 2`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenuItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Option 3`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					DropdownMenuSeparator($$renderer, {});
					$$renderer.push(`<!----> `);

					DropdownMenuItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Logout`);
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