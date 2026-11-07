import * as $ from 'svelte/internal/server';
import { AccordionItem, Accordion } from "flowbite-svelte";

export default function Color($$renderer) {
	Accordion($$renderer, {
		activeClass: 'bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-white focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800',
		inactiveClass: 'text-gray-500 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-gray-800',
		children: ($$renderer) => {
			{
				function header($$renderer) {
					$$renderer.push(`<!---->Header 2-1`);
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