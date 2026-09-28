import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

export default function Popover_05($$renderer) {
	const tips = [
		{
			description: "This is your new workspace. Here you'll find all your projects, recent activities, settings, and more.",
			title: 'Welcome to Dashboard'
		},

		{
			description: 'Use the toolbar above to create new projects, invite team members, or access settings.',
			title: 'Quick Actions'
		},

		{
			description: 'Click the support icon in the top right corner to access our help center and documentation.',
			title: 'Need Help?'
		}
	];

	let currentTip = 0;

	function handleNavigation() {
		if (currentTip === tips.length - 1) {
			currentTip = 0;
		} else {
			currentTip++;
		}
	}

	Popover($$renderer, {
		children: ($$renderer) => {
			{
				function child($$renderer, { props }) {
					Button($$renderer, $.spread_props([
						{ variant: 'outline' },
						props,
						{
							children: ($$renderer) => {
								$$renderer.push(`<!---->Tooltip-like with steps`);
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
					$$renderer.push(`<div class="space-y-3"><div class="space-y-1"><p class="text-[13px] font-medium">${$.escape(tips[currentTip].title)}</p> <p class="text-muted-foreground text-xs">${$.escape(tips[currentTip].description)}</p></div> <div class="flex items-center justify-between gap-2"><span class="text-muted-foreground text-xs">${$.escape(currentTip + 1)}/${$.escape(tips.length)}</span> <button class="text-xs font-medium hover:underline">${$.escape(currentTip === tips.length - 1 ? 'Start over' : 'Next')}</button></div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}