import * as $ from 'svelte/internal/server';
import { Accordion, AccordionItem } from "flowbite-svelte";

export default function OpenMultiple($$renderer) {
	Accordion($$renderer, {
		multiple: true,
		children: ($$renderer) => {
			{
				function header($$renderer) {
					$$renderer.push(`<!---->Header 1-1`);
				}

				AccordionItem($$renderer, {
					header,
					children: ($$renderer) => {
						$$renderer.push(`<p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p>`);
					},
					$$slots: { header: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function header($$renderer) {
					$$renderer.push(`<!---->Header 1-2`);
				}

				AccordionItem($$renderer, {
					header,
					children: ($$renderer) => {
						$$renderer.push(`<p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p>`);
					},
					$$slots: { header: true, default: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}