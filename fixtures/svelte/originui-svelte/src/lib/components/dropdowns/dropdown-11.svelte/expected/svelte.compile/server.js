import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Bolt from '@lucide/svelte/icons/bolt';
import BookOpen from '@lucide/svelte/icons/book-open';
import CircleUserRound from '@lucide/svelte/icons/circle-user-round';
import Layers2 from '@lucide/svelte/icons/layers-2';
import LogOut from '@lucide/svelte/icons/log-out';
import Pin from '@lucide/svelte/icons/pin';
import UserPen from '@lucide/svelte/icons/user-pen';
import AvatarImg from '$assets/avatar.jpg?w=64&h=64&enhanced';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

export default function Dropdown_11($$renderer) {
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
						class: 'flex items-start gap-3',
						children: ($$renderer) => {
							$$renderer.push(`<enhanced:img${$.attr('src', AvatarImg)} class="size-8 shrink-0 rounded-full" alt="Avatar"></enhanced:img> <div class="flex min-w-0 flex-col"><span class="text-foreground truncate text-sm font-medium">Keith Kennedy</span> <span class="text-muted-foreground truncate text-xs font-normal">k.kennedy@originui-svelte.com</span></div>`);
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
									Bolt($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$$renderer.push(`<!----> <span>Option 1</span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenuItem($$renderer, {
								children: ($$renderer) => {
									Layers2($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$$renderer.push(`<!----> <span>Option 2</span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenuItem($$renderer, {
								children: ($$renderer) => {
									BookOpen($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$$renderer.push(`<!----> <span>Option 3</span>`);
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

					DropdownMenuGroup($$renderer, {
						children: ($$renderer) => {
							DropdownMenuItem($$renderer, {
								children: ($$renderer) => {
									Pin($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$$renderer.push(`<!----> <span>Option 4</span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenuItem($$renderer, {
								children: ($$renderer) => {
									UserPen($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$$renderer.push(`<!----> <span>Option 5</span>`);
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
							LogOut($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$$renderer.push(`<!----> <span>Logout</span>`);
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