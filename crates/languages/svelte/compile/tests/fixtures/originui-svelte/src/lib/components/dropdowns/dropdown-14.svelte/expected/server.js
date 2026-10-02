import * as $ from 'svelte/internal/server';
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

export default function Dropdown_14($$renderer) {
	DropdownMenu($$renderer, {
		children: ($$renderer) => {
			{
				function child($$renderer, { props }) {
					Button($$renderer, $.spread_props([
						{
							size: 'icon',
							variant: 'ghost',
							class: 'rounded-full shadow-none',
							'aria-label': 'Open edit menu'
						},
						props,
						{
							children: ($$renderer) => {
								Plus($$renderer, { size: 16, 'aria-hidden': 'true' });
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
							$$renderer.push(`<!---->Add block`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownMenuItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<div class="border-border bg-background flex size-8 items-center justify-center rounded-lg border" aria-hidden="true">`);
							Type($$renderer, { size: 16, class: 'opacity-60' });
							$$renderer.push(`<!----></div> <div><div class="text-sm font-medium">Text</div> <div class="text-muted-foreground text-xs">Start writing with plain text</div></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownMenuItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<div class="border-border bg-background flex size-8 items-center justify-center rounded-lg border" aria-hidden="true">`);
							TextQuote($$renderer, { size: 16, class: 'opacity-60' });
							$$renderer.push(`<!----></div> <div><div class="text-sm font-medium">Quote</div> <div class="text-muted-foreground text-xs">Capture a quote</div></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownMenuItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<div class="border-border bg-background flex size-8 items-center justify-center rounded-lg border" aria-hidden="true">`);
							Minus($$renderer, { size: 16, class: 'opacity-60' });
							$$renderer.push(`<!----></div> <div><div class="text-sm font-medium">Divider</div> <div class="text-muted-foreground text-xs">Visually divide blocks</div></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownMenuItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<div class="border-border bg-background flex size-8 items-center justify-center rounded-lg border" aria-hidden="true">`);
							Heading1($$renderer, { size: 16, class: 'opacity-60' });
							$$renderer.push(`<!----></div> <div><div class="text-sm font-medium">Heading 1</div> <div class="text-muted-foreground text-xs">Big section heading</div></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownMenuItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<div class="border-border bg-background flex size-8 items-center justify-center rounded-lg border" aria-hidden="true">`);
							Heading2($$renderer, { size: 16, class: 'opacity-60' });
							$$renderer.push(`<!----></div> <div><div class="text-sm font-medium">Heading 2</div> <div class="text-muted-foreground text-xs">Medium section subheading</div></div>`);
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