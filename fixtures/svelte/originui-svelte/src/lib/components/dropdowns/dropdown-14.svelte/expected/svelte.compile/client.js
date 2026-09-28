import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Heading1 from '@lucide/svelte/icons/heading-1';
import Heading2 from '@lucide/svelte/icons/heading-2';
import Minus from '@lucide/svelte/icons/minus';
import Plus from '@lucide/svelte/icons/plus';
import TextQuote from '@lucide/svelte/icons/text-quote';
import Type from '@lucide/svelte/icons/type';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

var root = $.from_html(`<div class="border-border bg-background flex size-8 items-center justify-center rounded-lg border" aria-hidden="true"><!></div> <div><div class="text-sm font-medium">Text</div> <div class="text-muted-foreground text-xs">Start writing with plain text</div></div>`, 1);
var root_1 = $.from_html(`<div class="border-border bg-background flex size-8 items-center justify-center rounded-lg border" aria-hidden="true"><!></div> <div><div class="text-sm font-medium">Quote</div> <div class="text-muted-foreground text-xs">Capture a quote</div></div>`, 1);
var root_2 = $.from_html(`<div class="border-border bg-background flex size-8 items-center justify-center rounded-lg border" aria-hidden="true"><!></div> <div><div class="text-sm font-medium">Divider</div> <div class="text-muted-foreground text-xs">Visually divide blocks</div></div>`, 1);
var root_3 = $.from_html(`<div class="border-border bg-background flex size-8 items-center justify-center rounded-lg border" aria-hidden="true"><!></div> <div><div class="text-sm font-medium">Heading 1</div> <div class="text-muted-foreground text-xs">Big section heading</div></div>`, 1);
var root_4 = $.from_html(`<div class="border-border bg-background flex size-8 items-center justify-center rounded-lg border" aria-hidden="true"><!></div> <div><div class="text-sm font-medium">Heading 2</div> <div class="text-muted-foreground text-xs">Medium section subheading</div></div>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!>`, 1);

export default function Dropdown_14($$anchor) {
	DropdownMenu($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_6();
			var node = $.first_child(fragment_1);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props(
						{
							size: 'icon',
							variant: 'ghost',
							class: 'rounded-full shadow-none',
							'aria-label': 'Open edit menu'
						},
						props,
						{
							children: ($$anchor, $$slotProps) => {
								Plus($$anchor, { size: 16, 'aria-hidden': 'true' });
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
					var fragment_4 = root_5();
					var node_2 = $.first_child(fragment_4);

					DropdownMenuLabel(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Add block');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					DropdownMenuItem(node_3, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root();
							var div = $.first_child(fragment_5);
							var node_4 = $.child(div);

							Type(node_4, { size: 16, class: 'opacity-60' });
							$.reset(div);
							$.next(2);
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_3, 2);

					DropdownMenuItem(node_5, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_1();
							var div_1 = $.first_child(fragment_6);
							var node_6 = $.child(div_1);

							TextQuote(node_6, { size: 16, class: 'opacity-60' });
							$.reset(div_1);
							$.next(2);
							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_5, 2);

					DropdownMenuItem(node_7, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_2();
							var div_2 = $.first_child(fragment_7);
							var node_8 = $.child(div_2);

							Minus(node_8, { size: 16, class: 'opacity-60' });
							$.reset(div_2);
							$.next(2);
							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_7, 2);

					DropdownMenuItem(node_9, {
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_3();
							var div_3 = $.first_child(fragment_8);
							var node_10 = $.child(div_3);

							Heading1(node_10, { size: 16, class: 'opacity-60' });
							$.reset(div_3);
							$.next(2);
							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_9, 2);

					DropdownMenuItem(node_11, {
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = root_4();
							var div_4 = $.first_child(fragment_9);
							var node_12 = $.child(div_4);

							Heading2(node_12, { size: 16, class: 'opacity-60' });
							$.reset(div_4);
							$.next(2);
							$.append($$anchor, fragment_9);
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