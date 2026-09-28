import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<enhanced:img class="size-8 shrink-0 rounded-full" alt="Avatar"></enhanced:img> <div class="flex min-w-0 flex-col"><span class="text-foreground truncate text-sm font-medium">Keith Kennedy</span> <span class="text-muted-foreground truncate text-xs font-normal">k.kennedy@originui-svelte.com</span></div>`, 1);
var root_1 = $.from_html(`<!> <span>Option 1</span>`, 1);
var root_2 = $.from_html(`<!> <span>Option 2</span>`, 1);
var root_3 = $.from_html(`<!> <span>Option 3</span>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <span>Option 4</span>`, 1);
var root_6 = $.from_html(`<!> <span>Option 5</span>`, 1);
var root_7 = $.from_html(`<!> <!>`, 1);
var root_8 = $.from_html(`<!> <span>Logout</span>`, 1);
var root_9 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Dropdown_11($$anchor) {
	DropdownMenu($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_7();
			var node = $.first_child(fragment_1);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props(
						{
							size: 'icon',
							variant: 'outline',
							'aria-label': 'Open account menu'
						},
						props,
						{
							children: ($$anchor, $$slotProps) => {
								CircleUserRound($$anchor, { size: 16, 'aria-hidden': 'true' });
							},
							$$slots: { default: true }
						}
					));
				};

				DropdownMenuTrigger(node, { child, $$slots: { child: true } });
			}

			var node_1 = $.sibling(node, 2);

			DropdownMenuContent(node_1, {
				class: 'max-w-64',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_9();
					var node_2 = $.first_child(fragment_4);

					DropdownMenuLabel(node_2, {
						class: 'flex items-start gap-3',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root();
							var enhanced_img = $.first_child(fragment_5);

							$.next(2);
							$.template_effect(() => $.set_attribute(enhanced_img, 'src', AvatarImg));
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					DropdownMenuSeparator(node_3, {});

					var node_4 = $.sibling(node_3, 2);

					DropdownMenuGroup(node_4, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_4();
							var node_5 = $.first_child(fragment_6);

							DropdownMenuItem(node_5, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_1();
									var node_6 = $.first_child(fragment_7);

									Bolt(node_6, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$.next(2);
									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_5, 2);

							DropdownMenuItem(node_7, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_2();
									var node_8 = $.first_child(fragment_8);

									Layers2(node_8, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
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

									BookOpen(node_10, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$.next(2);
									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_4, 2);

					DropdownMenuSeparator(node_11, {});

					var node_12 = $.sibling(node_11, 2);

					DropdownMenuGroup(node_12, {
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root_7();
							var node_13 = $.first_child(fragment_10);

							DropdownMenuItem(node_13, {
								children: ($$anchor, $$slotProps) => {
									var fragment_11 = root_5();
									var node_14 = $.first_child(fragment_11);

									Pin(node_14, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$.next(2);
									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});

							var node_15 = $.sibling(node_13, 2);

							DropdownMenuItem(node_15, {
								children: ($$anchor, $$slotProps) => {
									var fragment_12 = root_6();
									var node_16 = $.first_child(fragment_12);

									UserPen(node_16, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$.next(2);
									$.append($$anchor, fragment_12);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_12, 2);

					DropdownMenuSeparator(node_17, {});

					var node_18 = $.sibling(node_17, 2);

					DropdownMenuItem(node_18, {
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = root_8();
							var node_19 = $.first_child(fragment_13);

							LogOut(node_19, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$.next(2);
							$.append($$anchor, fragment_13);
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