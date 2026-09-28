import * as $ from 'svelte/internal/server';
import { AccordionItem, Accordion } from "flowbite-svelte";
import { CartSolid, CogOutline } from "flowbite-svelte-icons";

export default function Icon($$renderer) {
	Accordion($$renderer, {
		children: ($$renderer) => {
			{
				function header($$renderer) {
					$$renderer.push(`<div class="flex items-center gap-2">`);
					CartSolid($$renderer, {});
					$$renderer.push(`<!----> <span>My Header 1</span></div>`);
				}

				AccordionItem($$renderer, {
					header,
					children: ($$renderer) => {
						$$renderer.push(`<p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo...</p> <p class="text-gray-500 dark:text-gray-400">Check out this guide to learn how to <a href="/" target="_blank" rel="noreferrer" class="text-blue-600 hover:underline dark:text-blue-500">get started</a> and start websites even faster with components on top of Tailwind CSS.</p>`);
					},
					$$slots: { header: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function header($$renderer) {
					$$renderer.push(`<div class="flex items-center gap-2">`);
					CogOutline($$renderer, {});
					$$renderer.push(`<!----> <span>My Header 2</span></div>`);
				}

				AccordionItem($$renderer, {
					header,
					children: ($$renderer) => {
						$$renderer.push(`<p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sintexplicabo...</p>`);
					},
					$$slots: { header: true, default: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}