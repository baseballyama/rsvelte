import * as $ from 'svelte/internal/server';
import { AccordionItem, Accordion } from "flowbite-svelte";

export default function Nesting($$renderer) {
	Accordion($$renderer, {
		children: ($$renderer) => {
			{
				function header($$renderer) {
					$$renderer.push(`<!---->My Header 1`);
				}

				AccordionItem($$renderer, {
					open: true,
					header,
					children: ($$renderer) => {
						Accordion($$renderer, {
							children: ($$renderer) => {
								{
									function header($$renderer) {
										$$renderer.push(`<!---->My Header 1`);
									}

									AccordionItem($$renderer, {
										header,
										children: ($$renderer) => {
											$$renderer.push(`<p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p> <p class="text-gray-500 dark:text-gray-400">Check out this guide to learn how to <a href="/" target="_blank" rel="noreferrer" class="text-blue-600 hover:underline dark:text-blue-500">get started</a> and start developing websites even faster with components on top of Tailwind CSS.</p>`);
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
											$$renderer.push(`<p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p> <p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p> <p class="mb-2 text-gray-500 dark:text-gray-400">Learn more about these technologies:</p> <ul class="list-disc ps-5 text-gray-500 dark:text-gray-400"><li><a href="/" target="_blank" rel="noreferrer" class="text-blue-600 hover:underline dark:text-blue-500">Lorem ipsum</a></li> <li><a href="https://tailwindui.com/" rel="noreferrer" target="_blank" class="text-blue-600 hover:underline dark:text-blue-500">Tailwind UI</a></li></ul>`);
										},
										$$slots: { header: true, default: true }
									});
								}

								$$renderer.push(`<!---->`);
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
					$$renderer.push(`<!---->My Header 2`);
				}

				AccordionItem($$renderer, {
					header,
					children: ($$renderer) => {
						$$renderer.push(`<p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p> <p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p> <p class="mb-2 text-gray-500 dark:text-gray-400">Learn more about these technologies:</p> <ul class="list-disc ps-5 text-gray-500 dark:text-gray-400"><li><a href="/" target="_blank" rel="noreferrer" class="text-blue-600 hover:underline dark:text-blue-500">Lorem ipsum</a></li> <li><a href="https://tailwindui.com/" rel="noreferrer" target="_blank" class="text-blue-600 hover:underline dark:text-blue-500">Tailwind UI</a></li></ul>`);
					},
					$$slots: { header: true, default: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}