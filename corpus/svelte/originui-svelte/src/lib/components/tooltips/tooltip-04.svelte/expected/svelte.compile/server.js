import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip';

export default function Tooltip_04($$renderer) {
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
										$$renderer.push(`<!---->W/ title`);
									},
									$$slots: { default: true }
								}
							]));
						}

						TooltipTrigger($$renderer, { child, $$slots: { child: true } });
					}

					$$renderer.push(`<!----> `);

					TooltipContent($$renderer, {
						class: 'py-3',
						children: ($$renderer) => {
							$$renderer.push(`<div class="space-y-1"><p class="text-[13px] font-medium">Tooltip with title</p> <p class="text-muted-foreground text-xs">Tooltips are made to be highly customizable, with features like dynamic placement, rich
					content, and a robust API. You can even use them as a full-featured dropdown menu by
					setting the <code>trigger</code> prop to <code>click</code>.</p></div>`);
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