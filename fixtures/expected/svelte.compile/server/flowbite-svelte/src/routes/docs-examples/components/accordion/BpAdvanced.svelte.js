import * as $ from 'svelte/internal/server';
import { AccordionItem, useCurrentBreakpoint, useBreakpoints, P } from "flowbite-svelte";

export default function BpAdvanced($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const breakpoints = useBreakpoints();
		const getCurrentBreakpoint = useCurrentBreakpoint();
		const currentBp = $.derived(getCurrentBreakpoint);

		{
			function header($$renderer) {
				$$renderer.push(`<!---->Desktop Only (Current: ${$.escape(currentBp())})`);
			}

			AccordionItem($$renderer, {
				open: breakpoints.lg,
				header,
				children: ($$renderer) => {
					P($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->This opens only on large screens and above.`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { header: true, default: true }
			});
		}
	});
}