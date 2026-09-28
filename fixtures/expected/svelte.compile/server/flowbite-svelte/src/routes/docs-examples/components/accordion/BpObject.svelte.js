import * as $ from 'svelte/internal/server';
import { AccordionItem, useBreakpoints, P } from "flowbite-svelte";

export default function BpObject($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const breakpoints = useBreakpoints();

		{
			function header($$renderer) {
				$$renderer.push(`<!---->Opens on medium screens+`);
			}

			AccordionItem($$renderer, {
				open: breakpoints.md,
				header,
				children: ($$renderer) => {
					P($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Content for tablets and desktop users.`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { header: true, default: true }
			});
		}
	});
}