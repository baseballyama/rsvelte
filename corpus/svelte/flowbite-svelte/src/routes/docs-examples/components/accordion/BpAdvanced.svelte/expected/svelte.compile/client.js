import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AccordionItem, useCurrentBreakpoint, useBreakpoints, P } from "flowbite-svelte";

export default function BpAdvanced($$anchor, $$props) {
	$.push($$props, true);

	const breakpoints = useBreakpoints();
	const getCurrentBreakpoint = useCurrentBreakpoint();
	const currentBp = $.derived(getCurrentBreakpoint);

	{
		const header = ($$anchor) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, `Desktop Only (Current: ${$.get(currentBp) ?? ''})`));
			$.append($$anchor, text);
		};

		AccordionItem($$anchor, {
			get open() {
				return breakpoints.lg;
			},
			header,
			children: ($$anchor, $$slotProps) => {
				P($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('This opens only on large screens and above.');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { header: true, default: true }
		});
	}

	$.pop();
}