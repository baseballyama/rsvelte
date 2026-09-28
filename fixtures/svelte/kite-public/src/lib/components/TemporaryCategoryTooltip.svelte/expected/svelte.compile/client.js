import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { flip, offset, shift, useFloating } from '@skeletonlabs/floating-ui-svelte';
import { fade } from 'svelte/transition';
import Portal from 'svelte-portal';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';

var root = $.from_html(`<div><div class="absolute -top-2 left-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2 w-0 h-0
				border-l-[6px] border-l-transparent
				border-r-[6px] border-r-transparent
				border-b-[8px] border-b-gray-800 dark:border-b-gray-700"></div> <div class="bg-gray-800 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-md shadow-lg max-w-xs"><p class="whitespace-nowrap"> </p></div></div>`);

export default function TemporaryCategoryTooltip($$anchor, $$props) {
	$.push($$props, true);

	let localShowTooltip = $.state(false);
	let timeoutId = null;
	let hasBeenShown = $.state(false);

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

	// Track tooltip visibility
	$.user_effect(() => {
		if ($$props.show && !$.get(localShowTooltip) && !$.get(hasBeenShown)) {
			$.set(localShowTooltip, true);
			$.set(hasBeenShown, true);

			// Clear any existing timeout
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			// Auto-dismiss after 3 seconds
			timeoutId = setTimeout(
				() => {
					$.set(localShowTooltip, false);
					timeoutId = null;
				},
				3000
			);
		} else if (!$$props.show && $.get(localShowTooltip)) {
			$.set(localShowTooltip, false);

			// Clear timeout if tooltip is being hidden externally
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
		}
	});

	// Update floating reference when tooltip should show
	$.user_effect(() => {
		if ($.get(localShowTooltip) && $$props.referenceElement && browser) {
			// Manually set the reference element
			floating.elements.reference = $$props.referenceElement;

			floating.update();

			// Update position on scroll
			const handleScroll = () => {
				floating.update();
			};

			// Listen to scroll events on window
			window.addEventListener('scroll', handleScroll, { passive: true });

			// Cleanup
			return () => {
				window.removeEventListener('scroll', handleScroll);
			};
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Portal($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var div_1 = $.sibling($.child(div), 2);
					var p = $.child(div_1);
					var text = $.only_child(p, true);

					$.reset(div_1);
					$.reset(div);
					$.bind_this(div, ($$value) => floating.elements.floating = $$value, () => floating?.elements?.floating);

					$.template_effect(
						($0) => {
							$.set_class(div, 1, `absolute top-0 left-0 z-popover pointer-events-none ${floating.isPositioned ? 'opacity-100' : 'opacity-0 invisible'}`);
							$.set_style(div, floating.floatingStyles);
							$.set_text(text, $0);
						},
						[
							() => s("app.temporaryCategoryNotice") || "Temporarily showing this category from shared link"
						]
					);

					$.transition(3, div, () => fade, () => ({ duration: 200 }));
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if ($.get(localShowTooltip) && $$props.referenceElement && browser) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}