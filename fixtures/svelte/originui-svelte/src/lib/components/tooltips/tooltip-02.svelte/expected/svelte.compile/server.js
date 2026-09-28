import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip';

export default function Tooltip_02($$renderer) {
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
										$$renderer.push(`<!---->Dark`);
									},
									$$slots: { default: true }
								}
							]));
						}

						TooltipTrigger($$renderer, { child, $$slots: { child: true } });
					}

					$$renderer.push(`<!----> `);

					TooltipContent($$renderer, {
						class: 'dark px-2 py-1 text-xs',
						children: ($$renderer) => {
							$$renderer.push(`<!---->This tooltip will be always dark`);
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