import * as $ from 'svelte/internal/server';
import { AccordionItem, useMediaQuery, P } from "flowbite-svelte";

export default function BpBasic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const isMdAndUp = useMediaQuery("(min-width: 768px)");

		{
			function header($$renderer) {
				$$renderer.push(`<!---->Opens on tablets and desktop`);
			}

			AccordionItem($$renderer, {
				open: isMdAndUp(),
				header,
				children: ($$renderer) => {
					P($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->This content is visible on medium screens and larger.`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { header: true, default: true }
			});
		}
	});
}