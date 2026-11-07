import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import BoltIcon from '@lucide/svelte/icons/bolt';
import BookOpenIcon from '@lucide/svelte/icons/book-open';
import Layers2Icon from '@lucide/svelte/icons/layers-2';
import LogOutIcon from '@lucide/svelte/icons/log-out';
import PinIcon from '@lucide/svelte/icons/pin';
import UserPenIcon from '@lucide/svelte/icons/user-pen';
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

export default function User_menu($$renderer) {
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
				align: 'end',
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
									BoltIcon($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$$renderer.push(`<!----> <span>Option 1</span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenuItem($$renderer, {
								children: ($$renderer) => {
									Layers2Icon($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$$renderer.push(`<!----> <span>Option 2</span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenuItem($$renderer, {
								children: ($$renderer) => {
									BookOpenIcon($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
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
									PinIcon($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$$renderer.push(`<!----> <span>Option 4</span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenuItem($$renderer, {
								children: ($$renderer) => {
									UserPenIcon($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
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
							LogOutIcon($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
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