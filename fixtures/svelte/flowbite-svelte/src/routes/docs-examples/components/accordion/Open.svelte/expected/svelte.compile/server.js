import * as $ from 'svelte/internal/server';
import { AccordionItem, Accordion } from "flowbite-svelte";

export default function Open($$renderer) {
	Accordion($$renderer, {
		children: ($$renderer) => {
			{
				function header($$renderer) {
					$$renderer.push(`<!---->Header 2-1`);
				}

				AccordionItem($$renderer, {
					open: true,
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
					$$renderer.push(`<!---->Header 2-2`);
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