import * as $ from 'svelte/internal/server';
import Button from '../ui/button.svelte';
import Club from '@lucide/svelte/icons/club';
import Diamond from '@lucide/svelte/icons/diamond';
import Heart from '@lucide/svelte/icons/heart';
import Spade from '@lucide/svelte/icons/spade';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export default function Popover_09($$renderer) {
	const tourSteps = [
		{
			description: "This is your new workspace. Here you'll find all your projects, recent activities, settings, and more.",
			icon: Heart,
			title: 'Heart'
		},

		{
			description: 'Use the toolbar above to create new projects, invite team members, or access settings.',
			icon: Diamond,
			title: 'Diamond'
		},

		{
			description: 'Click the support icon in the top right corner to access our help center and documentation.',
			icon: Club,
			title: 'Club'
		},

		{
			description: 'Press ⌘K to open the command palette. Use arrow keys to navigate and Enter to select an action.',
			icon: Spade,
			title: 'Spade'
		}
	];

	let currentStep = 0;
	let anchors = [];

	function handleNavigation() {
		if (currentStep === tourSteps.length - 1) {
			currentStep = 0;
		} else {
			currentStep++;
		}
	}

	$$renderer.push(`<div class="flex flex-col gap-4">`);

	Popover($$renderer, {
		onOpenChange: (open) => {
			if (open) currentStep = 0;
		},

		children: ($$renderer) => {
			$$renderer.push(`<div class="grid grid-cols-2 place-items-center gap-4"><!--[-->`);

			const each_array = $.ensure_array_like(tourSteps);

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let _ = each_array[index];

				$$renderer.push(`<div class="bg-secondary text-muted-foreground flex size-10 items-center justify-center rounded-lg text-sm font-medium">${$.escape(index + 1)}</div>`);
			}

			$$renderer.push(`<!--]--></div> `);

			{
				function child($$renderer, { props }) {
					Button($$renderer, $.spread_props([
						{ variant: 'outline' },
						props,
						{
							children: ($$renderer) => {
								$$renderer.push(`<!---->Start tour`);
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
				side: currentStep % 2 === 0 ? 'left' : 'right',
				customAnchor: anchors[currentStep],
				showArrow: true,
				children: ($$renderer) => {
					$$renderer.push(`<div class="space-y-3"><div class="space-y-1"><p class="text-[13px] font-medium">${$.escape(tourSteps[currentStep].title)}</p> <p class="text-muted-foreground text-xs">${$.escape(tourSteps[currentStep].description)}</p></div> <div class="flex items-center justify-between gap-2"><span class="text-muted-foreground text-xs">${$.escape(currentStep + 1)}/${$.escape(tourSteps.length)}</span> <button class="text-xs font-medium hover:underline">${$.escape(currentStep === tourSteps.length - 1 ? 'Start over' : 'Next')}</button></div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}