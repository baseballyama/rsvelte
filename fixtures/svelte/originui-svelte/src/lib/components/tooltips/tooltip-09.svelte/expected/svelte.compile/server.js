import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip';

export default function Tooltip_09($$renderer) {
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
										$$renderer.push(`<!---->Chart`);
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
							$$renderer.push(`<div class="space-y-2"><div class="text-[13px] font-medium">Tuesday, Aug 13</div> <div class="flex items-center gap-2 text-xs"><svg width="8" height="8" fill="currentColor" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" class="shrink-0 text-indigo-500" aria-hidden="true"><circle cx="4" cy="4" r="4"></circle></svg> <span class="flex grow gap-2">Sales <span class="ml-auto">$40</span></span></div> <div class="flex items-center gap-2 text-xs"><svg width="8" height="8" fill="currentColor" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" class="shrink-0 text-purple-500" aria-hidden="true"><circle cx="4" cy="4" r="4"></circle></svg> <span class="flex grow gap-2">Revenue <span class="ml-auto">$74</span></span></div> <div class="flex items-center gap-2 text-xs"><svg width="8" height="8" fill="currentColor" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" class="shrink-0 text-rose-500" aria-hidden="true"><circle cx="4" cy="4" r="4"></circle></svg> <span class="flex grow gap-2">Costs <span class="ml-auto">$410</span></span></div></div>`);
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