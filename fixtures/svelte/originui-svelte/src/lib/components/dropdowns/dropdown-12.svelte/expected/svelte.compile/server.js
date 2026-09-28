import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Bolt from '@lucide/svelte/icons/bolt';
import BookOpen from '@lucide/svelte/icons/book-open';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Layers2 from '@lucide/svelte/icons/layers-2';
import LogOut from '@lucide/svelte/icons/log-out';
import Pin from '@lucide/svelte/icons/pin';
import UserPen from '@lucide/svelte/icons/user-pen';
import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

export default function Dropdown_12($$renderer) {
	DropdownMenu($$renderer, {
		children: ($$renderer) => {
			{
				function child($$renderer, { props }) {
					Button($$renderer, $.spread_props([
						{ variant: 'ghost', class: 'h-auto p-0 hover:bg-transparent' },
						props,
						{
							children: ($$renderer) => {
								Avatar($$renderer, {
									children: ($$renderer) => {
										AvatarImage($$renderer, { src: './avatar.jpg', alt: 'Profile image' });
										$$renderer.push(`<!----> `);

										AvatarFallback($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->KK`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);
								ChevronDown($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
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
				class: 'max-w-64',
				children: ($$renderer) => {
					DropdownMenuLabel($$renderer, {
						class: 'flex min-w-0 flex-col',
						children: ($$renderer) => {
							$$renderer.push(`<span class="text-foreground truncate text-sm font-medium">Keith Kennedy</span> <span class="text-muted-foreground truncate text-xs font-normal">k.kennedy@originui-svelte.com</span>`);
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