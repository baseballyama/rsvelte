import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Globe from '@lucide/svelte/icons/globe';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip';

export default function Tooltip_05($$renderer) {
	TooltipProvider($$renderer, {
		delayDuration: 0,
		children: ($$renderer) => {
			Tooltip($$renderer, {
				children: ($$renderer) => {
					{
						function child($$renderer, { props }) {
							Button($$renderer, $.spread_props([
								{ variant: 'outline', size: 'sm' },
								props,
								{
									children: ($$renderer) => {
										$$renderer.push(`<!---->W/ icon`);
									},
									$$slots: { default: true }
								}
							]));
						}

						TooltipTrigger($$renderer, { child, $$slots: { child: true } });
					}

					$$renderer.push(`<!----> `);

					TooltipContent($$renderer, {
						class: 'dark py-3',
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex gap-3">`);

							Globe($$renderer, {
								class: 'mt-0.5 shrink-0 opacity-60',
								size: 16,
								'aria-hidden': 'true'
							});

							$$renderer.push(`<!----> <div class="space-y-1"><p class="text-[13px] font-medium">Tooltip with title and icon</p> <p class="text-muted-foreground text-xs">Tooltips are made to be highly customizable, with features like dynamic placement, rich
						content, and a robust API.</p></div></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}