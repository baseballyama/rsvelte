import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip/index.js';
import Plus from '@lucide/svelte/icons/plus';

export default function Button_22($$renderer) {
	TooltipProvider($$renderer, {
		children: ($$renderer) => {
			Tooltip($$renderer, {
				children: ($$renderer) => {
					{
						function child($$renderer, { props }) {
							Button($$renderer, $.spread_props([
								{
									variant: 'outline',
									size: 'icon',
									'aria-label': 'Add new item'
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

						TooltipTrigger($$renderer, { child, $$slots: { child: true } });
					}

					$$renderer.push(`<!----> `);

					TooltipContent($$renderer, {
						class: 'px-2 py-1 text-xs',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Tooltip`);
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