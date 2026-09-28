import * as $ from 'svelte/internal/server';
import { AccordionItem, useMediaQuery, useBreakpoints, P } from "flowbite-svelte";

export default function BpRange($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const breakpoints = useBreakpoints();

		// Open from sm to lg (640px - 1023px)
		const tabletRange = $.derived(() => breakpoints.sm && !breakpoints.lg);

		// Open on specific breakpoints only
		const specificSizes = $.derived(() => breakpoints.sm && !breakpoints.md || breakpoints.lg && !breakpoints.xl);

		// Custom pixel range
		const customRange = useMediaQuery("(min-width: 640px) and (max-width: 1023px)");

		{
			function header($$renderer) {
				$$renderer.push(`<!---->Tablet Range (640px - 1023px)`);
			}

			AccordionItem($$renderer, {
				open: tabletRange(),
				header,
				children: ($$renderer) => {
					P($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Open on tablets, closed on phones and large desktops.`);
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
				$$renderer.push(`<!---->Small phones OR Large desktops only`);
			}

			AccordionItem($$renderer, {
				open: specificSizes(),
				header,
				children: ($$renderer) => {
					P($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Open on sm-only OR lg-only, closed on other sizes.`);
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
				$$renderer.push(`<!---->Custom Range`);
			}

			AccordionItem($$renderer, {
				open: customRange(),
				header,
				children: ($$renderer) => {
					P($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Define exact pixel ranges for precise control.`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { header: true, default: true }
			});
		}

		$$renderer.push(`<!---->`);
	});
}