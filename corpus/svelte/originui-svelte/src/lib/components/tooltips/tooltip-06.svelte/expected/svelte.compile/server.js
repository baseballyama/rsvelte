import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ContentImg from '$assets/dialog-content.png?w=764&h=432&enhanced';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip';

export default function Tooltip_06($$renderer) {
	TooltipProvider($$renderer, {
		delayDuration: 0,
		children: ($$renderer) => {
			Tooltip($$renderer, {
				open: true,
				children: ($$renderer) => {
					{
						function child($$renderer, { props }) {
							Button($$renderer, $.spread_props([
								{ variant: 'outline', size: 'sm' },
								props,
								{
									children: ($$renderer) => {
										$$renderer.push(`<!---->W/ image`);
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
							$$renderer.push(`<div class="max-w-[382px] space-y-2"><enhanced:img class="w-full rounded"${$.attr('src', ContentImg)} alt="Content image"></enhanced:img> <div class="space-y-1"><p class="text-[13px] font-medium">Tooltip with title and icon</p> <p class="text-muted-foreground text-xs">Tooltips are made to be highly customizable, with features like dynamic placement, rich
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