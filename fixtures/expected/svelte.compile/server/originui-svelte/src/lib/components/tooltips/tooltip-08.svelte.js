import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip';

export default function Tooltip_08($$renderer) {
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
										$$renderer.push(`<!---->Stats`);
									},
									$$slots: { default: true }
								}
							]));
						}

						TooltipTrigger($$renderer, { child, $$slots: { child: true } });
					}

					$$renderer.push(`<!----> `);

					TooltipContent($$renderer, {
						class: ' py-3',
						children: ($$renderer) => {
							$$renderer.push(`<ul class="grid gap-3 text-xs"><li class="grid gap-0.5"><span class="text-muted-foreground">Status</span> <span class="font-medium">Completed</span></li> <li class="grid gap-0.5"><span class="text-muted-foreground">Code Coverage</span> <span class="font-medium">94.3%</span></li> <li class="grid gap-0.5"><span class="text-muted-foreground">Last Deploy</span> <span class="font-medium">Today at 15:42</span></li> <li class="grid gap-0.5"><span class="text-muted-foreground">Performance Score</span> <span class="font-medium">98/100</span></li></ul>`);
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