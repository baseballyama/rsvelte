import * as $ from 'svelte/internal/server';
import { flip, offset, shift, useFloating } from '@skeletonlabs/floating-ui-svelte';
import { fade } from 'svelte/transition';
import Portal from 'svelte-portal';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';

export default function TemporaryCategoryTooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { show, referenceElement } = $$props;
		let localShowTooltip = false;
		let timeoutId = null;
		let hasBeenShown = false;

		// Floating UI setup for tooltip
		const floating = useFloating({
			placement: 'bottom',
			strategy: 'fixed', // Use fixed positioning to work with scrollable containers
			middleware: [
				offset(8), // 8px gap from button
				flip(), // Flip if no space
				shift({ padding: 8 }) // Keep within viewport
			]
		});

		if (// Track tooltip visibility
		// Clear any existing timeout
		// Auto-dismiss after 3 seconds
		// Clear timeout if tooltip is being hidden externally
		// Update floating reference when tooltip should show
		// Manually set the reference element
		// Update position on scroll
		// Listen to scroll events on window
		// Cleanup
		localShowTooltip && referenceElement && browser) {
			$$renderer.push('<!--[0-->');

			Portal($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div${$.attr_class(`absolute top-0 left-0 z-popover pointer-events-none ${floating.isPositioned ? 'opacity-100' : 'opacity-0 invisible'}`)}${$.attr_style(floating.floatingStyles)}><div class="absolute -top-2 left-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-gray-800 dark:border-b-gray-700"></div> <div class="bg-gray-800 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-md shadow-lg max-w-xs"><p class="whitespace-nowrap">${$.escape(s("app.temporaryCategoryNotice") || "Temporarily showing this category from shared link")}</p></div></div>`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}