import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import BookIcon from '@lucide/svelte/icons/book';
import InfoIcon from '@lucide/svelte/icons/info';
import LifeBuoyIcon from '@lucide/svelte/icons/life-buoy';
import MessageCircleMoreIcon from '@lucide/svelte/icons/message-circle-more';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

export default function Info_menu($$renderer) {
	DropdownMenu($$renderer, {
		children: ($$renderer) => {
			{
				function child($$renderer, { props }) {
					Button($$renderer, $.spread_props([
						{
							size: 'icon',
							variant: 'ghost',
							class: 'size-8 rounded-full shadow-none',
							'aria-label': 'Open edit menu'
						},
						props,
						{
							children: ($$renderer) => {
								InfoIcon($$renderer, {
									class: 'text-muted-foreground',
									size: 16,
									'aria-hidden': 'true'
								});
							},
							$$slots: { default: true }
						}
					]));
				}

				DropdownMenuTrigger($$renderer, { child, $$slots: { child: true } });
			}

			$$renderer.push(`<!----> `);

			DropdownMenuContent($$renderer, {
				class: 'pb-2',
				children: ($$renderer) => {
					DropdownMenuLabel($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Need help?`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					{
						function child($$renderer, { props }) {
							$$renderer.push(`<a${$.attributes({ href: '#', ...props })}>`);
							BookIcon($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$$renderer.push(`<!----> Documentation</a>`);
						}

						DropdownMenuItem($$renderer, {
							class: 'cursor-pointer py-1 focus:bg-transparent focus:underline',
							child,
							$$slots: { child: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function child($$renderer, { props }) {
							$$renderer.push(`<a${$.attributes({ href: '#', ...props })}>`);
							LifeBuoyIcon($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$$renderer.push(`<!----> Support</a>`);
						}

						DropdownMenuItem($$renderer, {
							class: 'cursor-pointer py-1 focus:bg-transparent focus:underline',
							child,
							$$slots: { child: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function child($$renderer, { props }) {
							$$renderer.push(`<a${$.attributes({ href: '#', ...props })}>`);
							MessageCircleMoreIcon($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$$renderer.push(`<!----> Contact us</a>`);
						}

						DropdownMenuItem($$renderer, {
							class: 'cursor-pointer py-1 focus:bg-transparent focus:underline',
							child,
							$$slots: { child: true }
						});
					}

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}