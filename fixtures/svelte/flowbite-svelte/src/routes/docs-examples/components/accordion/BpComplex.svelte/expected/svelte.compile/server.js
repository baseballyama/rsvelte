import * as $ from 'svelte/internal/server';

import {
	Accordion,
	AccordionItem,
	P,
	useMediaQuery,
	useBreakpoints,
	useCurrentBreakpoint
} from "flowbite-svelte";

export default function BpComplex($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Different approaches to responsive behavior
		const isMdAndUp = useMediaQuery("(min-width: 768px)");

		const breakpoints = useBreakpoints();
		const getCurrentBreakpoint = useCurrentBreakpoint();
		const currentBp = $.derived(getCurrentBreakpoint);
		const tabletOnly = $.derived(() => breakpoints.sm && !breakpoints.lg);
		const mobileOnly = $.derived(() => !breakpoints.sm);

		Accordion($$renderer, {
			children: ($$renderer) => {
				{
					function header($$renderer) {
						$$renderer.push(`<!---->📱 Tablet &amp; Desktop (Current: ${$.escape(currentBp())})`);
					}

					AccordionItem($$renderer, {
						open: isMdAndUp(),
						header,
						children: ($$renderer) => {
							P($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Opens on tablets and larger screens. Stays closed on mobile.`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { header: true, default: true }
					});
				}

				$$renderer.push(`<!----> `);

				{
					function header($$renderer) {
						$$renderer.push(`<!---->Always Interactive`);
					}

					AccordionItem($$renderer, {
						header,
						children: ($$renderer) => {
							P($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->This accordion item behaves normally on all screen sizes.`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { header: true, default: true }
					});
				}

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Accordion($$renderer, {
			children: ($$renderer) => {
				{
					function header($$renderer) {
						$$renderer.push(`<!---->📱 Tablet Only (640px - 1023px)`);
					}

					AccordionItem($$renderer, {
						open: tabletOnly(),
						header,
						children: ($$renderer) => {
							P($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->This opens automatically on tablets but closes on mobile phones and large desktop screens.`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { header: true, default: true }
					});
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Accordion($$renderer, {
			children: ($$renderer) => {
				{
					function header($$renderer) {
						$$renderer.push(`<!---->📱 Mobile Only (below 640px)`);
					}

					AccordionItem($$renderer, {
						open: mobileOnly(),
						header,
						children: ($$renderer) => {
							P($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Expanded by default on mobile for better accessibility, collapsed on larger screens to save space.`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { header: true, default: true }
					});
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}