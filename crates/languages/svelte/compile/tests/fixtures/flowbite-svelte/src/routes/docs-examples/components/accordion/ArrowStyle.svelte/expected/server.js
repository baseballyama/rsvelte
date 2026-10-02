import * as $ from 'svelte/internal/server';
import { AccordionItem, Accordion } from "flowbite-svelte";
import { ChevronDoubleUpOutline, ChevronDoubleDownOutline } from "flowbite-svelte-icons";

export default function ArrowStyle($$renderer) {
	Accordion($$renderer, {
		children: ($$renderer) => {
			{
				function header($$renderer) {
					$$renderer.push(`<!---->Header 2-1`);
				}

				function arrowup($$renderer) {
					ChevronDoubleUpOutline($$renderer, { class: '-me-0.5 h-6 w-6' });
				}

				function arrowdown($$renderer) {
					ChevronDoubleDownOutline($$renderer, { class: '-me-0.5 h-6 w-6' });
				}

				AccordionItem($$renderer, {
					header,
					arrowup,
					arrowdown,
					children: ($$renderer) => {
						$$renderer.push(`<p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p>`);
					},
					$$slots: { header: true, arrowup: true, arrowdown: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function header($$renderer) {
					$$renderer.push(`<!---->Header 2-2`);
				}

				function arrowup($$renderer) {
					ChevronDoubleUpOutline($$renderer, { class: '-me-0.5 h-6 w-6' });
				}

				function arrowdown($$renderer) {
					ChevronDoubleDownOutline($$renderer, { class: '-me-0.5 h-6 w-6' });
				}

				AccordionItem($$renderer, {
					header,
					arrowup,
					arrowdown,
					children: ($$renderer) => {
						$$renderer.push(`<p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p>`);
					},
					$$slots: { header: true, arrowup: true, arrowdown: true, default: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}