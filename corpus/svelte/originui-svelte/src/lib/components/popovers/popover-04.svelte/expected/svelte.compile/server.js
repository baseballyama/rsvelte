import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

export default function Popover_04($$renderer) {
	Popover($$renderer, {
		children: ($$renderer) => {
			{
				function child($$renderer, { props }) {
					Button($$renderer, $.spread_props([
						{ variant: 'outline' },
						props,
						{
							children: ($$renderer) => {
								$$renderer.push(`<!---->Tooltip-like popover`);
							},
							$$slots: { default: true }
						}
					]));
				}

				PopoverTrigger($$renderer, { child, $$slots: { child: true } });
			}

			$$renderer.push(`<!----> `);

			PopoverContent($$renderer, {
				class: 'max-w-[280px] py-3 shadow-none',
				side: 'top',
				children: ($$renderer) => {
					$$renderer.push(`<div class="space-y-3"><div class="space-y-1"><p class="text-[13px] font-medium">Popover with button</p> <p class="text-muted-foreground text-xs">I am a popover that would like to look like a tooltip. I can‘t be a tooltip because
					of the interactive element inside me.</p></div> `);

					Button($$renderer, {
						size: 'sm',
						class: 'h-7 px-2',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Know more`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}