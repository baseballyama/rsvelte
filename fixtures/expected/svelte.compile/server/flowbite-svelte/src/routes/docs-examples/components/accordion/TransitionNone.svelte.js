import * as $ from 'svelte/internal/server';
import { AccordionItem, Accordion } from "flowbite-svelte";

export default function TransitionNone($$renderer) {
	Accordion($$renderer, {
		transitionType: 'none',
		children: ($$renderer) => {
			{
				function header($$renderer) {
					$$renderer.push(`<!---->My Header 1`);
				}

				AccordionItem($$renderer, {
					header,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Content A`);
					},
					$$slots: { header: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function header($$renderer) {
					$$renderer.push(`<!---->My Header 2`);
				}

				AccordionItem($$renderer, {
					header,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Content B`);
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
					$$renderer.push(`<!---->transitionType: "none"`);
				}

				AccordionItem($$renderer, {
					transitionType: 'none',
					header,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Content C`);
					},
					$$slots: { header: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function header($$renderer) {
					$$renderer.push(`<!---->transitionType: default`);
				}

				AccordionItem($$renderer, {
					header,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Content D`);
					},
					$$slots: { header: true, default: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}