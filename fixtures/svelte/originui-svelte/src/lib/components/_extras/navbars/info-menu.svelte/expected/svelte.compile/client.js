import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<a><!> Documentation</a>`);
var root_1 = $.from_html(`<a><!> Support</a>`);
var root_2 = $.from_html(`<a><!> Contact us</a>`);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Info_menu($$anchor) {
	DropdownMenu($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node = $.first_child(fragment_1);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props(
						{
							size: 'icon',
							variant: 'ghost',
							class: 'size-8 rounded-full shadow-none',
							'aria-label': 'Open edit menu'
						},
						props,
						{
							children: ($$anchor, $$slotProps) => {
								InfoIcon($$anchor, {
									class: 'text-muted-foreground',
									size: 16,
									'aria-hidden': 'true'
								});
							},
							$$slots: { default: true }
						}
					));
				};

				DropdownMenuTrigger(node, { child, $$slots: { child: true } });
			}

			var node_1 = $.sibling(node, 2);

			DropdownMenuContent(node_1, {
				class: 'pb-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_3();
					var node_2 = $.first_child(fragment_4);

					DropdownMenuLabel(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Need help?');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					{
						const child = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;
							var a = root();

							$.attribute_effect(a, () => ({ href: '#', ...props() }));

							var node_4 = $.child(a);

							BookIcon(node_4, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$.next();
							$.reset(a);
							$.append($$anchor, a);
						};

						DropdownMenuItem(node_3, {
							class: 'cursor-pointer py-1 focus:bg-transparent focus:underline',
							child,
							$$slots: { child: true }
						});
					}

					var node_5 = $.sibling(node_3, 2);

					{
						const child = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;
							var a_1 = root_1();

							$.attribute_effect(a_1, () => ({ href: '#', ...props() }));

							var node_6 = $.child(a_1);

							LifeBuoyIcon(node_6, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$.next();
							$.reset(a_1);
							$.append($$anchor, a_1);
						};

						DropdownMenuItem(node_5, {
							class: 'cursor-pointer py-1 focus:bg-transparent focus:underline',
							child,
							$$slots: { child: true }
						});
					}

					var node_7 = $.sibling(node_5, 2);

					{
						const child = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;
							var a_2 = root_2();

							$.attribute_effect(a_2, () => ({ href: '#', ...props() }));

							var node_8 = $.child(a_2);

							MessageCircleMoreIcon(node_8, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
							$.next();
							$.reset(a_2);
							$.append($$anchor, a_2);
						};

						DropdownMenuItem(node_7, {
							class: 'cursor-pointer py-1 focus:bg-transparent focus:underline',
							child,
							$$slots: { child: true }
						});
					}

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}