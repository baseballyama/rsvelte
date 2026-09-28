import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span class="text-foreground truncate text-sm font-medium">Keith Kennedy</span> <span class="text-muted-foreground truncate text-xs font-normal">k.kennedy@originui-svelte.com</span>`, 1);
var root_2 = $.from_html(`<!> <span>Option 1</span>`, 1);
var root_3 = $.from_html(`<!> <span>Option 2</span>`, 1);
var root_4 = $.from_html(`<!> <span>Option 3</span>`, 1);
var root_5 = $.from_html(`<!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <span>Option 4</span>`, 1);
var root_7 = $.from_html(`<!> <span>Option 5</span>`, 1);
var root_8 = $.from_html(`<!> <span>Logout</span>`, 1);
var root_9 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function User_menu($$anchor) {
	DropdownMenu($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props({ variant: 'ghost', class: 'h-auto p-0 hover:bg-transparent' }, props, {
						children: ($$anchor, $$slotProps) => {
							Avatar($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_1 = $.first_child(fragment_4);

									AvatarImage(node_1, { src: './avatar.jpg', alt: 'Profile image' });

									var node_2 = $.sibling(node_1, 2);

									AvatarFallback(node_2, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('KK');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					}));
				};

				DropdownMenuTrigger(node, { child, $$slots: { child: true } });
			}

			var node_3 = $.sibling(node, 2);

			DropdownMenuContent(node_3, {
				class: 'max-w-64',
				align: 'end',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_9();
					var node_4 = $.first_child(fragment_5);

					DropdownMenuLabel(node_4, {
						class: 'flex min-w-0 flex-col',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_1();

							$.next(2);
							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					DropdownMenuSeparator(node_5, {});

					var node_6 = $.sibling(node_5, 2);

					DropdownMenuGroup(node_6, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_5();
							var node_7 = $.first_child(fragment_7);

							DropdownMenuItem(node_7, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_2();
									var node_8 = $.first_child(fragment_8);

									BoltIcon(node_8, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$.next(2);
									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_7, 2);

							DropdownMenuItem(node_9, {
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_3();
									var node_10 = $.first_child(fragment_9);

									Layers2Icon(node_10, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$.next(2);
									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});

							var node_11 = $.sibling(node_9, 2);

							DropdownMenuItem(node_11, {
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root_4();
									var node_12 = $.first_child(fragment_10);

									BookOpenIcon(node_12, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$.next(2);
									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_6, 2);

					DropdownMenuSeparator(node_13, {});

					var node_14 = $.sibling(node_13, 2);

					DropdownMenuGroup(node_14, {
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = root();
							var node_15 = $.first_child(fragment_11);

							DropdownMenuItem(node_15, {
								children: ($$anchor, $$slotProps) => {
									var fragment_12 = root_6();
									var node_16 = $.first_child(fragment_12);

									PinIcon(node_16, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$.next(2);
									$.append($$anchor, fragment_12);
								},
								$$slots: { default: true }
							});

							var node_17 = $.sibling(node_15, 2);

							DropdownMenuItem(node_17, {
								children: ($$anchor, $$slotProps) => {
									var fragment_13 = root_7();
									var node_18 = $.first_child(fragment_13);

									UserPenIcon(node_18, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$.next(2);
									$.append($$anchor, fragment_13);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});

					var node_19 = $.sibling(node_14, 2);

					DropdownMenuSeparator(node_19, {});

					var node_20 = $.sibling(node_19, 2);

					DropdownMenuItem(node_20, {
						children: ($$anchor, $$slotProps) => {
							var fragment_14 = root_8();
							var node_21 = $.first_child(fragment_14);

							LogOutIcon(node_21, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$.next(2);
							$.append($$anchor, fragment_14);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}